import type {
  LanTransferFileChunkMessage,
  LanTransferFileEndMessage,
  LanTransferFileStartMessage,
  LanTransferIncomingMessage
} from '@/types/lanTransfer'

/**
 * Generic message validator.
 *
 * Validates that the message has the correct type and required fields.
 *
 * @param msg - The message to validate.
 * @param type - The expected message type.
 * @param requiredFields - The list of fields that must be present in the message.
 * @returns True if the message is valid, false otherwise.
 */
const validateMessage = (msg: unknown, type: string, requiredFields: string[]): boolean => {
  if (!msg || typeof msg !== 'object') return false
  const m = msg as Record<string, unknown>
  if (m.type !== type) return false
  return requiredFields.every(field => field in m && m[field] !== undefined)
}

/**
 * Validates a handshake message.
 *
 * Checks if the message is of type 'handshake' and contains the required fields:
 * 'version' and 'platform'.
 *
 * @param msg - The message to validate.
 * @returns True if the message is a valid handshake message, false otherwise.
 */
export const isValidHandshakeMessage = (
  msg: unknown
): msg is Extract<LanTransferIncomingMessage, { type: 'handshake' }> => {
  return validateMessage(msg, 'handshake', ['version', 'platform'])
}

/**
 * Validates a ping message.
 *
 * Checks if the message is of type 'ping'.
 *
 * @param msg - The message to validate.
 * @returns True if the message is a valid ping message, false otherwise.
 */
export const isValidPingMessage = (msg: unknown): msg is Extract<LanTransferIncomingMessage, { type: 'ping' }> => {
  return validateMessage(msg, 'ping', [])
}

/**
 * Validates a file_start message.
 *
 * Checks if the message is of type 'file_start' and contains all required metadata fields
 * (transferId, fileName, fileSize, mimeType, checksum, totalChunks, chunkSize) with correct types.
 *
 * @param msg - The message to validate.
 * @returns True if the message is a valid file_start message, false otherwise.
 */
export const isValidFileStartMessage = (msg: unknown): msg is LanTransferFileStartMessage => {
  if (
    !validateMessage(msg, 'file_start', [
      'transferId',
      'fileName',
      'fileSize',
      'mimeType',
      'checksum',
      'totalChunks',
      'chunkSize'
    ])
  ) {
    return false
  }

  const m = msg as Record<string, unknown>
  return (
    typeof m.transferId === 'string' &&
    typeof m.fileName === 'string' &&
    typeof m.fileSize === 'number' &&
    typeof m.mimeType === 'string' &&
    typeof m.checksum === 'string' &&
    typeof m.totalChunks === 'number' &&
    typeof m.chunkSize === 'number'
  )
}

/**
 * Validates a file_chunk message (JSON mode only).
 *
 * Note: v1 Binary frame mode doesn't use this validator.
 * Checks if the message is of type 'file_chunk' and contains required fields:
 * 'transferId', 'chunkIndex', and 'data'.
 *
 * @param msg - The message to validate.
 * @returns True if the message is a valid file_chunk message, false otherwise.
 */
export const isValidFileChunkMessage = (msg: unknown): msg is LanTransferFileChunkMessage => {
  if (!validateMessage(msg, 'file_chunk', ['transferId', 'chunkIndex', 'data'])) {
    return false
  }

  const m = msg as Record<string, unknown>
  return typeof m.transferId === 'string' && typeof m.chunkIndex === 'number' && typeof m.data === 'string'
}

/**
 * Validates a file_end message.
 *
 * Checks if the message is of type 'file_end' and contains the required 'transferId'.
 *
 * @param msg - The message to validate.
 * @returns True if the message is a valid file_end message, false otherwise.
 */
export const isValidFileEndMessage = (msg: unknown): msg is LanTransferFileEndMessage => {
  if (!validateMessage(msg, 'file_end', ['transferId'])) {
    return false
  }

  const m = msg as Record<string, unknown>
  return typeof m.transferId === 'string'
}
