import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PDFDocument from 'pdfkit';
import { Repository } from 'typeorm';
import { Facture } from './entities/facture.entity';

@Injectable()
export class FacturePdfService {
  constructor(
    @InjectRepository(Facture)
    private readonly factureRepository: Repository<Facture>,
  ) {}

  async genererPdf(facture: Facture): Promise<Buffer> {
    const completeFacture = await this.factureRepository.findOne({
      where: { id: facture.id },
      relations: {
        session: {
          borne: { site: true },
          client: true,
          vehicule: true,
        },
        grilleTarifaire: true,
      },
    });
    if (!completeFacture?.session) {
      throw new NotFoundException('Données de facture incomplètes');
    }

    const session = completeFacture.session;
    const grille = completeFacture.grilleTarifaire;
    const energie = Number(session.energieConsommee ?? 0);
    const debut = new Date(session.dateDebut);
    const fin = session.dateFin ? new Date(session.dateFin) : debut;
    const dureeMinutes = Math.max(0, Math.ceil((fin.getTime() - debut.getTime()) / 60000));
    const prixKwh = Number(grille?.prixParKwh ?? 0);
    const prixMinute = Number(grille?.prixParMinute ?? 0);
    const sousTotalEnergie = energie * prixKwh;
    const sousTotalTemps = dureeMinutes * prixMinute;

    return new Promise<Buffer>((resolve, reject) => {
      const document = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.once('error', reject);
      document.once('end', () => resolve(Buffer.concat(chunks)));

      const client = session.client;
      const borne = session.borne;
      const site = borne?.site;
      const formatDate = (date: Date) => date.toLocaleString('fr-FR');
      const ligne = (label: string, value: string) => {
        document.fontSize(10).fillColor('#333333').text(label, 60, document.y, { continued: true });
        document.font('Helvetica-Bold').text(` ${value}`);
        document.font('Helvetica');
      };

      document.font('Helvetica-Bold').fontSize(20).fillColor('#111111')
        .text('EV Charging Platform');
      document.font('Helvetica').fontSize(11).fillColor('#555555')
        .text(`Facture N° ${completeFacture.numero}`);
      document.moveDown(1.5);

      document.font('Helvetica-Bold').fontSize(13).fillColor('#111111').text('Client');
      document.font('Helvetica').fontSize(10).fillColor('#333333');
      ligne('Nom :', `${client?.prenom ?? ''} ${client?.nom ?? ''}`.trim() || 'Non renseigné');
      ligne('Email :', client?.email ?? 'Non renseigné');
      document.moveDown();

      document.font('Helvetica-Bold').fontSize(13).fillColor('#111111').text('Session de recharge');
      document.font('Helvetica').fontSize(10).fillColor('#333333');
      ligne('Borne :', borne?.identifiantUnique ?? 'Non renseignée');
      ligne('Site :', site ? `${site.nom} - ${site.adresse}, ${site.ville}` : 'Non renseigné');
      ligne('Début :', formatDate(debut));
      ligne('Fin :', session.dateFin ? formatDate(fin) : 'Non renseignée');
      ligne('Durée :', `${dureeMinutes} minute(s)`);
      ligne('Énergie :', `${energie.toFixed(3)} kWh`);
      ligne('Authentification :', session.methodeAuth === 'rfid' ? 'RFID' : 'QR Code');
      if (session.vehicule) ligne('Véhicule :', `${session.vehicule.immatriculation}${session.vehicule.marque ? ` - ${session.vehicule.marque}` : ''}`);
      document.moveDown();

      document.font('Helvetica-Bold').fontSize(13).fillColor('#111111').text('Détail du calcul');
      document.font('Helvetica').fontSize(10).fillColor('#333333');
      ligne('Énergie :', `${energie.toFixed(3)} kWh x ${prixKwh.toFixed(4)} = ${sousTotalEnergie.toFixed(2)}`);
      if (grille?.prixParMinute != null) {
        ligne('Temps :', `${dureeMinutes} min x ${prixMinute.toFixed(4)} = ${sousTotalTemps.toFixed(2)}`);
      }
      document.moveDown();
      document.font('Helvetica-Bold').fontSize(15).fillColor('#111111')
        .text(`Montant total : ${Number(completeFacture.montantTotal).toFixed(2)}`);
      document.moveDown(2);
      document.font('Helvetica').fontSize(9).fillColor('#666666')
        .text(`Date d'émission : ${formatDate(new Date(completeFacture.dateEmission))}`)
        .text('Facture générée automatiquement.');

      document.end();
    });
  }
}
