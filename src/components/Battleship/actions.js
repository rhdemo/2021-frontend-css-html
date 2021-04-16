export const boardLocked = board => ({
  type: "BOARD_LOCKED",
  payload: { board }
});

export const attack = coordinates => ({
  type: "ATTACK",
  payload: coordinates
});

export const bonus = hits => ({
  type: 'BONUS',
  payload: { hits }
});

export const showError = message => ({
  type: "SHOW_ERROR_MESSAGE",
  payload: message
})
