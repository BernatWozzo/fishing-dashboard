// Función para calcular la iluminación lunar basada en fórmulas astronómicas estándar
export const calculateIllumination = (date) => {
  const diff = date - new Date('2001-01-01T00:00:00Z');
  const days = diff / 1000 / 60 / 60 / 24;
  const synodicMonth = 29.53058867;
  const newMoons = days / synodicMonth;
  const phase = newMoons - Math.floor(newMoons);
  const illumination = 0.5 * (1 - Math.cos(phase * 2 * Math.PI));
  return illumination * 100;
};

export default calculateIllumination;
