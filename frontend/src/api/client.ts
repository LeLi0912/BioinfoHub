import axios from 'axios';
import { logger } from './logger';

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

client.interceptors.request.use((config) => {
  logger.apiRequest(
    config.method?.toUpperCase() ?? 'GET',
    config.url ?? '',
    config.params
  );
  return config;
});

client.interceptors.response.use(
  (response) => {
    logger.apiResponse(
      response.config.url ?? '',
      response.status,
      `duration=${Date.now() - ((response.config as unknown) as Record<string, number>)._start || 0}ms`
    );
    return response;
  },
  (error) => {
    if (error.response) {
      logger.apiError(
        error.config?.url ?? '',
        error.response.status,
        error.response.data?.detail ?? error.message
      );
    } else {
      logger.apiError(error.config?.url ?? '', 0, error.message);
    }
    return Promise.reject(error);
  }
);

export default client;
