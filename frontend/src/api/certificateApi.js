import { apiClient } from "./client";

export const certificateApi = {
  getCertificate: (certId) => apiClient.get(`/certificates/${certId}`),
  verifyCertificate: (certId) => apiClient.get(`/verify/${certId}`),
};
