import { request } from './request';

export const tags = {
  list: () => request<string[]>('/tags'),
};
