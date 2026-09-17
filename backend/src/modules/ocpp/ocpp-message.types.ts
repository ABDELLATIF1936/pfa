export type OcppAction =
  | 'BootNotification'
  | 'StatusNotification'
  | 'Heartbeat'
  | 'Authorize'
  | 'StartTransaction'
  | 'MeterValues'
  | 'StopTransaction';

export type OcppCallFrame<TPayload = Record<string, unknown>> = [
  number,
  string,
  string,
  TPayload,
];

export type OcppCallResultFrame<TPayload = Record<string, unknown>> = [
  number,
  string,
  TPayload,
];

export type OcppCallErrorFrame = [
  number,
  string,
  string,
  string,
  Record<string, unknown>,
];

export type OcppFrame<TPayload = Record<string, unknown>> =
  | OcppCallFrame<TPayload>
  | OcppCallResultFrame<TPayload>
  | OcppCallErrorFrame;

export interface BootNotificationPayload {
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialNumber?: string;
  chargeBoxSerialNumber?: string;
  firmwareVersion?: string;
  iccid?: string;
  imsi?: string;
  meterType?: string;
  meterSerialNumber?: string;
}

export interface StatusNotificationPayload {
  connectorId: number;
  errorCode: string;
  status: string;
  timestamp?: string;
  info?: string;
  vendorId?: string;
  vendorErrorCode?: string;
}

export interface AuthorizePayload {
  idTag: string;
}

export interface StartTransactionPayload {
  connectorId: number;
  idTag: string;
  meterStart: number;
  timestamp: string;
}

export interface MeterValueSample {
  value: string;
  unit?: string;
  measurand?: string;
}

export interface MeterValueEntry {
  timestamp?: string;
  sampledValue: MeterValueSample[];
}

export interface MeterValuesPayload {
  connectorId: number;
  transactionId: number;
  meterValue: MeterValueEntry[];
}

export interface StopTransactionPayload {
  transactionId: number;
  idTag: string;
  meterStop: number;
  timestamp: string;
  reason?: string;
}

export interface BootNotificationResponsePayload {
  status: 'Accepted' | 'Rejected';
  currentTime: string;
  interval: number;
}

export interface OcppIdTagInfo {
  status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';
}

export interface AuthorizeResponsePayload {
  idTagInfo: OcppIdTagInfo;
}

export interface StartTransactionResponsePayload {
  transactionId: number;
  idTagInfo: OcppIdTagInfo;
}

export interface StopTransactionResponsePayload {
  idTagInfo: OcppIdTagInfo;
}

export interface OcppConnectionMeta {
  identifiantUnique: string;
  chargePointId?: string;
}
