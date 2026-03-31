export const debugLog = (label: string, value: any) => {
  console.log(`${label}:`, value);
};

export const debugAlert = (label: string, value: any) => {
  alert(`${label}:` + value);
};

export const debugLogMany = (
  pairs: { label: string; value: any }[]
) => {
  const message = pairs
    .map(p => `${p.label}: ${p.value}`)
    .join("\n");

  console.log(message);
};

export const debugAlertMany = (
  pairs: { label: string; value: any }[]
) => {
  const message = pairs
    .map(p => `${p.label}: ${p.value}`)
    .join("\n");

  alert(message);
};

