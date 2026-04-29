import { apiClient } from "./client";

export const verifyCertificate = (id) => {
  return apiClient.get(`/certificates/verify/${id}`);
};

export const getCertificate = (id) => {
  return apiClient.get(`/certificates/${id}`);
};
