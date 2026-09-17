/*
 * Simulateur de borne OCPP-J 1.6 pour démonstration.
 *
 * Lancement rapide :
 *   cd backend
 *   npm install ws @types/ws inquirer@8 chalk
 *   npm run simulator
 *
 * Étapes :
 *   1) choisir l'identifiantUnique de la borne
 *   2) configurer l'URL OCPP (défaut: ws://localhost:3000/ocpp)
 *   3) utiliser le menu interactif pour simuler badge RFID, charge, panne, etc.
 *
 * Pourquoi ws.terminate() au lieu de ws.close() ?
 *   - Simule une vraie coupure réseau / coupure électrique / arrêt brut.
 *   - close() négocie proprement la fermeture, alors que terminate() coupe immédiatement la
 *     connexion, ce qui permet de vérifier la robustesse du Central System lors d'un incident.
 *
 * Pourquoi une énergie croissante aléatoire ?
 *   - Pour rendre la démo plus réaliste qu'une courbe plate.
 *   - Une borne physique ne charge pas à vitesse constante ; la consommation suit des variations.
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ws = require('ws');

const DEFAULT_SERVER_URL = 'ws://localhost:3001/ocpp';
const DEFAULT_BORNE_ID = 'B_MC_001';
const DEFAULT_ID_TAG = 'CARD_TEST_001';

interface SimulatorState {
  connected: boolean;
  sessionActive: boolean;
  transactionId: number | null;
  energyKwh: number;
  startTime: Date | null;
  intervalId: NodeJS.Timeout | null;
  borneId: string;
  serverUrl: string;
  verbose: boolean;
  currentIdTag: string;
  lastMeterValue: number;
}

const state: SimulatorState = {
  connected: false,
  sessionActive: false,
  transactionId: null,
  energyKwh: 0,
  startTime: null,
  intervalId: null,
  borneId: DEFAULT_BORNE_ID,
  serverUrl: DEFAULT_SERVER_URL,
  verbose: false,
  currentIdTag: DEFAULT_ID_TAG,
  lastMeterValue: 0,
};

let socket: any = null;
const pendingRequests = new Map<
  string,
  { resolve: (value: any) => void; reject: (reason?: any) => void; timeout: NodeJS.Timeout; action: string }
>();

function logInfo(message: string) {
  console.log(chalk.cyan(`ℹ️  ${message}`));
}

function logSuccess(message: string) {
  console.log(chalk.green(`✅ ${message}`));
}

function logError(message: string) {
  console.log(chalk.red(`❌ ${message}`));
}

function logSent(action: string, payload: any) {
  console.log(chalk.blue(`📤 ${action}`), chalk.dim(JSON.stringify(payload)));
}

function logReceived(action: string, payload: any, isError = false) {
  const color = isError ? chalk.red : chalk.green;
  console.log(color(`📥 ${action}`), chalk.dim(JSON.stringify(payload)));
}

function formatStatusSummary(): string {
  return [
    `Borne: ${state.borneId}`,
    `Connexion: ${state.connected ? 'ouverte' : 'fermée'}`,
    `Session: ${state.sessionActive ? 'active' : 'inactive'}`,
    `Transaction: ${state.transactionId ?? '—'}`,
    `Énergie: ${state.energyKwh.toFixed(2)} kWh`,
    `Début: ${state.startTime ? new Date(state.startTime).toLocaleTimeString() : '—'}`,
  ].join(' | ');
}

function writeStateSummary() {
  console.log(chalk.yellow('\n--- État actuel ---'));
  console.log(formatStatusSummary());
  console.log(chalk.yellow('------------------\n'));
}

function sendOcppCall(action: string, payload: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!socket || socket.readyState !== ws.OPEN) {
      logError(`La connexion n'est pas ouverte. Impossible d'envoyer ${action}.`);
      reject(new Error(`La connexion n'est pas ouverte. Impossible d'envoyer ${action}.`));
      return;
    }

    const uniqueId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const frame = [2, uniqueId, action, payload];
    const timeout = setTimeout(() => {
      const pending = pendingRequests.get(uniqueId);

      if (pending) {
        clearTimeout(pending.timeout);
        pendingRequests.delete(uniqueId);
        logError(`⏱️ Timeout: pas de réponse pour l'action ${pending.action}`);
        pending.reject(new Error(`Timeout: pas de réponse du serveur pour ${pending.action}`));
        return;
      }

      logError(`⏱️ Timeout: pas de réponse pour l'action ${action} (requête déjà retirée de la map)`);
      reject(new Error(`Timeout: pas de réponse du serveur pour ${action}`));
    }, 10000);

    pendingRequests.set(uniqueId, { resolve, reject, timeout, action });
    logSent(action, payload);
    socket.send(JSON.stringify(frame));
  });
}

function sendCallResult(uniqueId: string, payload: Record<string, any>) {
  if (!socket || socket.readyState !== ws.OPEN) return
  socket.send(JSON.stringify([3, uniqueId, payload]))
  logSent(`CALLRESULT ${uniqueId}`, payload)
}

function sendBootNotification() {
  return sendOcppCall('BootNotification', {
    chargePointVendor: 'DemoVendor',
    chargePointModel: 'EV-SIM-01',
    chargePointSerialNumber: 'SIM-001',
  });
}

function sendAuthorize(idTag: string) {
  return sendOcppCall('Authorize', { idTag });
}

function sendStartTransaction(idTag: string) {
  return sendOcppCall('StartTransaction', {
    connectorId: 1,
    idTag,
    meterStart: Math.round(state.energyKwh * 1000),
    timestamp: new Date().toISOString(),
  });
}

function sendMeterValues() {
  if (!state.sessionActive || state.transactionId === null) {
    logError('Aucune session active, impossible d’envoyer MeterValues.');
    return;
  }

  const deltaKwh = Number((0.5 + Math.random() * 1.0).toFixed(2));
  state.energyKwh = Number((state.energyKwh + deltaKwh).toFixed(2));
  state.lastMeterValue = Number((state.energyKwh * 1000).toFixed(0));

  sendOcppCall('MeterValues', {
    connectorId: 1,
    transactionId: state.transactionId,
    meterValue: [
      {
        timestamp: new Date().toISOString(),
        sampledValue: [{ value: String(state.lastMeterValue), unit: 'Wh' }],
      },
    ],
  });

  console.log(chalk.magenta(`🔋 Énergie actuelle : ${state.energyKwh.toFixed(2)} kWh`));
}

function sendStatusNotification(status: string, errorCode = 'NoError') {
  sendOcppCall('StatusNotification', {
    connectorId: 1,
    errorCode,
    status,
  });
}

function sendStopTransaction(reason = 'Local') {
  if (!state.sessionActive || state.transactionId === null) {
    logError('Aucune transaction active à stopper.');
    return;
  }

  sendOcppCall('StopTransaction', {
    transactionId: state.transactionId,
    idTag: state.currentIdTag,
    meterStop: Math.round(state.energyKwh * 1000),
    timestamp: new Date().toISOString(),
    reason,
  });

  state.sessionActive = false;
  state.transactionId = null;
  state.startTime = null;
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
}

async function handleRemoteStartTransaction(uniqueId: string, payload: Record<string, any>) {
  sendCallResult(uniqueId, { status: 'Accepted' })

  if (state.sessionActive) {
    logInfo('RemoteStartTransaction accepté, mais une session est déjà active.')
    return
  }

  const idTag = typeof payload.idTag === 'string' && payload.idTag.trim()
    ? payload.idTag.trim()
    : DEFAULT_ID_TAG
  state.currentIdTag = idTag

  try {
    const authorizeResponse = await sendAuthorize(idTag)
    if (authorizeResponse?.idTagInfo?.status !== 'Accepted') {
      logError(`RemoteStart refusé par Authorize: ${authorizeResponse?.idTagInfo?.status ?? 'Unknown'}`)
      return
    }

    const startResponse = await sendStartTransaction(idTag)
    if (startResponse?.idTagInfo?.status !== 'Accepted') {
      logError(`RemoteStart refusé par StartTransaction: ${startResponse?.idTagInfo?.status ?? 'Unknown'}`)
      return
    }

    state.transactionId = Number(startResponse.transactionId)
    state.sessionActive = true
    state.startTime = new Date()
    logSuccess(`RemoteStart confirmé, session démarrée avec transaction ${state.transactionId}`)
  } catch (error) {
    logError(`Échec du démarrage distant: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function handleRemoteStopTransaction(uniqueId: string, payload: Record<string, any>) {
  if (!state.sessionActive || state.transactionId === null || Number(payload.transactionId) !== state.transactionId) {
    sendCallResult(uniqueId, { status: 'Rejected' })
    return
  }

  sendCallResult(uniqueId, { status: 'Accepted' })
  sendStopTransaction('Remote')
}

function installMessageHandler() {
  if (!socket) return;

  socket.on('message', async (raw: Buffer) => {
    try {
      const message = JSON.parse(raw.toString());

      if (!Array.isArray(message)) {
        logInfo(`Message brut reçu: ${raw.toString()}`);
        return;
      }

      const [messageTypeId, uniqueId, field2, field3, field4] = message as any[];

      if (messageTypeId === 3) {
        // OCPP CALLRESULT: [3, uniqueId, payload]
        const responsePayload = field2 ?? {};
        const pending = uniqueId ? pendingRequests.get(uniqueId) : undefined;

        if (pending) {
          clearTimeout(pending.timeout);
          pendingRequests.delete(uniqueId);
          pending.resolve(responsePayload);
        }

        if (
          responsePayload?.idTagInfo?.status === 'Accepted' &&
          responsePayload.transactionId !== undefined
        ) {
          state.transactionId = Number(responsePayload.transactionId);
          state.sessionActive = true;
          state.startTime = new Date();
          logSuccess(`Transaction démarrée : ${state.transactionId}`);
        }

        const summary = {
          type: 'CALLRESULT',
          uniqueId,
          payload: responsePayload,
        };

        if (state.verbose) {
          logReceived('CALLRESULT', responsePayload, false);
        } else {
          logReceived('Réponse OCPP', summary, false);
        }
      } else if (messageTypeId === 2) {
        const action = field2 as string
        const payload = (field3 ?? {}) as Record<string, any>

        if (action === 'RemoteStartTransaction') {
          await handleRemoteStartTransaction(String(uniqueId), payload)
        } else if (action === 'RemoteStopTransaction') {
          await handleRemoteStopTransaction(String(uniqueId), payload)
        } else {
          sendCallResult(String(uniqueId), {})
          logInfo(`Action serveur non implémentée: ${action}`)
        }
      } else if (messageTypeId === 4) {
        // OCPP CALLERROR: [4, uniqueId, errorCode, errorDescription, details]
        const errorCode = field2 ?? 'ERROR';
        const errorDescription = field3 ?? 'Erreur inconnue';

        if (uniqueId && pendingRequests.has(uniqueId)) {
          const pending = pendingRequests.get(uniqueId)!;
          clearTimeout(pending.timeout);
          pendingRequests.delete(uniqueId);
          pending.reject(new Error(`${errorCode}: ${errorDescription}`));
        }

        logReceived(`Erreur ${errorCode}`, { uniqueId, description: errorDescription, details: field4 ?? {} }, true);
      } else {
        logInfo(`Message brut reçu: ${raw.toString()}`);
      }
    } catch (error) {
      logError(`Impossible de parser le message OCPP: ${raw.toString()}`);
      console.error(error);
    }
  });

  socket.on('open', () => {
    state.connected = true;
    logSuccess(`Connexion établie vers ${state.serverUrl}`);
    sendBootNotification();
    writeStateSummary();
  });

  socket.on('close', (code, reason) => {
    state.connected = false;
    state.sessionActive = false;
    state.transactionId = null;
    state.startTime = null;
    if (state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
    logInfo(`Connexion fermée (code ${code}, raison: ${reason?.toString() || 'n/a'})`);
    writeStateSummary();
  });

  socket.on('error', (error: Error) => {
    logError(`Erreur WebSocket: ${error.message}`);
  });
}

function closeSocketWithLog(reason: string, force = false) {
  if (!socket) return;

  logInfo(`Fermeture demandée de la connexion WebSocket: ${reason}`);
  if (force) {
    socket.terminate();
  } else {
    socket.close();
  }
}

async function promptConnection() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'borneId',
      message: 'IdentifiantUnique de la borne à simuler',
      default: DEFAULT_BORNE_ID,
    },
    {
      type: 'input',
      name: 'serverUrl',
      message: 'URL du serveur OCPP',
      default: DEFAULT_SERVER_URL,
    },
    {
      type: 'confirm',
      name: 'verbose',
      message: 'Activer le mode verbose (affichage du JSON brut) ?',
      default: false,
    },
  ]);

  state.borneId = answers.borneId.trim();
  state.serverUrl = answers.serverUrl.trim();
  state.verbose = answers.verbose;

  const targetUrl = `${state.serverUrl.replace(/\/$/, '')}/${state.borneId}`;
  logInfo(`Connexion à ${targetUrl} ...`);
  socket = new ws(targetUrl, ['ocpp1.6']);
  installMessageHandler();

  await new Promise<void>((resolve, reject) => {
    if (!socket) {
      reject(new Error('La connexion WebSocket n’a pas pu être créée.'));
      return;
    }

    socket.once('open', resolve);
    socket.once('error', reject);
    socket.once('close', (code: number, reason: Buffer) => {
      reject(new Error(`Connexion fermée avant ouverture (code ${code}, raison: ${reason?.toString() || 'n/a'})`));
    });
  });
}

async function showMenu() {
  const choices = [
    { name: '🔑 Simuler un badge RFID (Authorize + StartTransaction)', value: 'rfid' },
    { name: '⚡ Démarrer l’envoi automatique de MeterValues', value: 'start-meter', disabled: !state.connected || !state.sessionActive },
    { name: '🛑 Arrêter la charge normalement (StopTransaction)', value: 'stop', disabled: !state.connected || !state.sessionActive },
    { name: '⚠️ Simuler une panne pendant la charge', value: 'fault', disabled: !state.connected || !state.sessionActive },
    { name: '🔌 Simuler une déconnexion inattendue', value: 'terminate', disabled: !state.connected },
    { name: '📊 Afficher l’état actuel de la session', value: 'status' },
    { name: '🚪 Quitter', value: 'quit' },
  ];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Que souhaitez-vous faire ?',
      choices,
    },
  ]);

  switch (answer.action) {
    case 'rfid': {
      const idTagAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'idTag',
          message: 'IdTag RFID à utiliser',
          default: DEFAULT_ID_TAG,
        },
      ]);

      state.currentIdTag = idTagAnswer.idTag.trim();

      try {
        const authorizeResponse = await sendAuthorize(state.currentIdTag);
        console.log(chalk.yellow(`📌 Réponse Authorize: ${JSON.stringify(authorizeResponse)}`));

        if (authorizeResponse?.idTagInfo?.status === 'Accepted') {
          const startResponse = await sendStartTransaction(state.currentIdTag);
          const transactionStatus = startResponse?.idTagInfo?.status;

          if (transactionStatus === 'Accepted') {
            state.transactionId = Number(startResponse.transactionId);
            state.sessionActive = true;
            state.startTime = new Date();
            logSuccess(`Session démarrée avec transaction ${state.transactionId}`);
          } else if (transactionStatus === 'ConcurrentTx') {
            logError(
              `⚠️ Impossible de démarrer : une session est déjà en cours sur cette borne (transaction existante : ${startResponse?.transactionId ?? 'inconnue'})`,
            );
          } else {
            logError(`❌ StartTransaction refusé: ${transactionStatus ?? 'Unknown'}`);
          }
        } else {
          logError(`❌ Badge refusé: ${authorizeResponse?.idTagInfo?.status ?? 'Unknown'}`);
        }
      } catch (error) {
        logError(`Erreur de validation RFID: ${error instanceof Error ? error.message : String(error)}`);
      }

      break;
    }

    case 'start-meter': {
      if (state.sessionActive && state.transactionId !== null && !state.intervalId) {
        state.intervalId = setInterval(() => {
          sendMeterValues();
        }, 3000);
        logSuccess('Intervalle de MeterValues activé toutes les 3 secondes.');
      }
      break;
    }

    case 'stop': {
      sendStopTransaction('Local');
      break;
    }

    case 'fault': {
      sendStatusNotification('Faulted', 'GroundFailure');
      sendStopTransaction('EmergencyStop');
      break;
    }

    case 'terminate': {
      if (socket) {
        closeSocketWithLog('Déconnexion inattendue simulée via le menu', true);
      }
      break;
    }

    case 'status': {
      writeStateSummary();
      break;
    }

    case 'quit': {
      if (state.sessionActive) {
        sendStopTransaction('Local');
      }
      if (socket && socket.readyState === ws.OPEN) {
        closeSocketWithLog('Fermeture demandée par l\'utilisateur via le menu Quitter');
      }
      process.exit(0);
    }
  }

  writeStateSummary();
  if (state.connected) {
    await showMenu();
  }
}

async function main() {
  console.log(chalk.bold.cyan('⚡ Simulateur de borne OCPP-J 1.6'));
  console.log(chalk.dim('Connexion OCPP sur le protocole ws://.../ocpp/{identifiantUnique}'));
  await promptConnection();

  // Lancement du flux principal : une fois connecté, la borne envoie BootNotification dès l'ouverture.
  // Le menu interactif permet ensuite de démo live, sans lancer de séquence fixe.
  await showMenu();
}

main().catch((error) => {
  logError(`Erreur fatale du simulateur: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
