export type Institution = {
  id: string;
  name: string;
  shortcode: string;
};

export const MOCK_INSTITUTION: Institution = {
  id: "nti-nrb",
  name: "Nairobi Technical Institute",
  shortcode: "KMTC-NRB",
};

/** Mock credentials for UI testing before APIs are ready. */
export const MOCK_CREDENTIALS = {
  admissionNumber: "NTI/2023/1234",
  password: "NTI/2023/1234",
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockDiscoverInstitution(
  _query: string,
  _mode: "email" | "shortcode",
): Promise<Institution> {
  await delay(1200);
  return MOCK_INSTITUTION;
}

export async function mockSignIn(
  admissionNumber: string,
  password: string,
): Promise<{ success: true } | { success: false; error: string }> {
  await delay(800);

  const admission = admissionNumber.trim();
  const secret = password.trim();

  if (
    admission === MOCK_CREDENTIALS.admissionNumber &&
    secret === MOCK_CREDENTIALS.password
  ) {
    return { success: true };
  }

  return {
    success: false,
    error: "Invalid admission number or password.",
  };
}
