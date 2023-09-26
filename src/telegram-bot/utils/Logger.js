// utils/logger.js
import {bot} from "../index.js";

export function logInfo(message) {
    console.log(`[INFO]: ${message}`);
}

export function logError(message, error) {
    console.error(`[ERROR]: ${message}`, error);
}

// utils/httpsAgent.js
import HttpsProxyAgent from 'https-proxy-agent';
import { proxy } from '../config';

const proxyUrl = `http://${proxy.auth}@${proxy.host}:${proxy.port}`;
export const agent = new HttpsProxyAgent(proxyUrl);


