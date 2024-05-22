import { AppError } from "@/Helpers/AppError";
import messages from "@/Helpers/messages";
import config from "@/configs/index";
import axios from "axios";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs";
import jwt from "jsonwebtoken";
import libPhoneNumberJs, { CountryCode } from "libphonenumber-js";
import ms from "ms";
import path from "path";

import { JWT, OAuth2Client, type TokenPayload } from "google-auth-library";

import { IGoogleServiceAccount } from "@/configs/interface";
const countries = require("../../countries.json");

function handleApiError(err: any) {
  if (err.response!.data) {
    throw new AppError(
      err.response.data.message || err.message,
      err.response.status || 500
    );
  } else if (err.request) {
    throw new AppError(err.message || "Unable to complete request.", 500);
  } else {
    throw new AppError(err.message, 500);
  }
}

function jwtDecoder(payload: string): any {
  return jwt.verify(payload, config.jwt.key, {
    ignoreExpiration: false,
  });
}

/**
 * JWT ==> Json Web Token
 *
 * Convert payload to JWT string
 * @param {any} payload - Payload to encode
 * @return {object} - Encoded data
 */
function jwtEncoder(payload: any) {
  return {
    accessToken: jwt.sign(payload, config.jwt.key, {
      expiresIn: config.jwt.ttl,
    }),
    expiresAt: new Date().getTime() + ms(config.jwt.ttl),
  };
}

/**
 * This function is use to remove html tags= require(string
 *
 * @param {string} str   String to sanitize
 * @return {string}  String converted
 */
function stripTags(str: string): string {
  return str.toString().replace(/(<([^>]+)>)/gi, "");
}

function inputValidation(input: string): string {
  const word = stripTags(input.toString());
  return word.trim();
}

function capitalize(str: string) {
  const strArr = str.split(" ");
  return strArr.reduce((prev, curr) => {
    return `${prev} ${curr.charAt(0).toUpperCase()}${curr.slice(1)}`.trim();
  }, "");
}

function hasWhiteSpace(str: string, field = "Username") {
  if (/\s/g.test(str)) {
    throw new AppError(`${field} must not contain whitespace character`, 400);
  }
  return false;
}

function isValidEmail(email: string) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(String(email).toLowerCase())) {
    throw new AppError(messages.ERR_INVALID_EMAIL, 400);
  }
  return true;
}

/**
 * Generate account default password
 * @return {string} password
 */
function generatePassword() {
  const seedValue = "012345689!@#$%^&*()_";
  let password = "";

  let count = 0;
  while (count < 10) {
    const index = Number(Number(Math.random() * 20).toFixed(0));
    password += seedValue[index];
    count++;
  }

  return password;
}

/**
 * Generate OTP digits
 * @param {number} length - Length of character to generate
 * @return {number}
 */
function generateOTP(length = 4) {
  const seedValue =
    "6780123456789123456789127801234567567891234567891278012344567891278012345675678912345018376107382918";
  let ud = "";

  let count = 0;
  while (count < length) {
    const index = Number(Number(Math.random() * 100).toFixed(0));
    ud += seedValue[index];
    count++;
  }

  return ud;
}

function generateReferralCode() {
  const seedValue = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm";
  let ud = "";

  let count = 0;
  while (count < 6) {
    const index = Number(Number(Math.random() * 24).toFixed(0));
    ud += seedValue[index];
    count++;
  }

  return ud;
}

/**
 * Encrypt password
 * @param {string} plainPassword - Plain password
 * @return {string} - Encrypted password
 */
async function hashPassword(plainPassword: string) {
  return await bcrypt.hash(plainPassword, 10);
}

/**
 * Compare hashed password and plain password to check if correct
 * @param {string} plainPassword - Plain password to check
 * @param {string} hashedPassword - Hashed password to confirm
 * @param {string} key - Key for hashed password
 * @return {boolean}
 */
function comparePassword(
  plainPassword: string,
  hashedPassword: string,
  key: string
) {
  return plainPassword === decryptData(hashedPassword, key);
}

/**
 * Generate a token
 * @return {string} - Generated characters
 */
function createToken() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  return crypto.createHash("sha256").update(resetToken).digest("hex");
}

/**
 * Check if data is set
 * @param {any} record - Data to check
 * @param {string} recordType - Type of record
 * @return {any}
 */
function recordExists(record: any, recordType = "Record") {
  if (Array.isArray(record)) {
    record = record[0];
  }
  if (!record) {
    throw new AppError(
      messages.ERR_RECORD.replace(/Record/g, inputValidation(recordType)),
      404
    );
  }
  return true;
}

function getFileContent(fileName: string): string {
  const basePath = path.join(config.basePath, "..", "public");
  const contentPath = path.join(basePath, fileName);
  if (fs.existsSync(contentPath)) {
    return fs.readFileSync(contentPath, { encoding: "utf-8" });
  }

  return fileName;
}

function isValidPhoneNumber(
  phoneNumber: string,
  countryShortCode: CountryCode = "NG"
): string {
  const result = libPhoneNumberJs(phoneNumber, countryShortCode);
  // validate phone number
  if (!result || !result.isValid()) {
    throw new AppError(messages.INVALID_PHONE, 400);
  }
  phoneNumber = result.number;
  return phoneNumber;
}

/**
 * To group array object by specified property
 *
 * @param {Array} objectArray - Array object
 * @param {string} property - Property to group with
 * @return {object}
 */
async function groupBy(objectArray: any[], property: string) {
  const acc: any[] = [];
  for (let i = 0; i < objectArray.length; i++) {
    const item = objectArray[i];
    if (item.data && typeof item.data === "string") {
      item.data = JSON.parse(item.data);
    }

    let key = item[property];

    if (property === "createdAt" && key) {
      const date = new Date(key).getDate();
      const month = new Date(key).getMonth() + 1;
      const year = new Date(key).getFullYear();
      key = `${date}-${month}-${year}`;
    }

    let index = acc.findIndex(function (itm: any) {
      return itm[property] === key;
    });

    // Add object to list for given key's value
    const prop = new Map();
    if (index < 0) {
      index = acc.length;
      prop.set(property, key);

      acc[index] = { ...Object.fromEntries(prop), items: [{ ...item }] };
    } else {
      acc[index].items.push(item);
    }
  }

  return acc;
}

function isBase64Image(base64String: string) {
  // Check if the string is a data URL
  if (!base64String.startsWith("data:image/")) {
    return false;
  }

  // Extract the image type from the data URL
  const matches = base64String.match(/^data:image\/([a-zA-Z+]+);base64,/);
  if (!matches || matches.length < 2) {
    return false;
  }

  const imageType = matches[1].toLowerCase();

  // Check if the image type is one of the supported types
  const supportedTypes = ["jpeg", "jpg", "png", "gif", "bmp", "webp"];
  return supportedTypes.includes(imageType);
}

/**
 * Check if user is restricted
 * @param {User | Administrator | null} user - User data
 * @return {boolean}
 */
function isRestricted(user: any) {
  if (user.disabled) {
    throw new AppError(messages.ERR_ACC_LOCKED, 403);
  }

  if (user.archived) {
    throw new AppError(messages.ERR_ACC_ARCHIVED, 403);
  }
  return false;
}

function isDisabled(user: any) {
  if (user.disabled) {
    throw new AppError(messages.ERR_ACC_DISABLED, 403);
  }
  return false;
}

function isLocked(user: any) {
  if (user.freezed) {
    throw new AppError(messages.ERR_ACC_LOCKED, 403);
  }
  return false;
}

async function validateAuthorization(authorizationHeader: string) {
  const authorizations = authorizationHeader.split(" ");
  if (
    authorizations.length < 2 ||
    authorizations.length > 2 ||
    (String(authorizations[0]).toUpperCase() !== "BEARER" &&
      String(authorizations[0]).toUpperCase() !== "BASIC")
  ) {
    throw new AppError(messages.ACCESS_INV_ERR, 400);
  }

  const accessToken = String(authorizations[1]);
  if (String(authorizations[0]).toUpperCase() !== "BEARER") {
    throw new AppError(messages.ACCESS_INV_ERR, 400);
  }

  // Decode access token
  const decodedPayload = jwtDecoder(accessToken);

  const data = Object.assign(decodedPayload, { env: config.environment });

  return data;
}

/**
 * Remove sensitive properties
 * @param user - User's record
 * @return {User | Administrator}
 */
function removeSensitiveData(user: any) {
  if (user.pin) delete user!.pin;
  delete user.password;
  delete user.id;
  return user;
}

async function getIPInfo(ip: string) {
  const res = await axios
    .get(`https://api.techniknews.net/ipgeo/${ip}`)
    .catch((err) => {
      console.log(`Error getting IP info:${err.message}`);
    });

  if (res && res.data) {
    return res.data;
  }
}

/**
 * Delete file from a folder
 * @param {string} fileName - Name of file to delete
 * @param {string} folderName - Name of folder to delete file from
 * @return {boolean | void} - This will return true if successful otherwise false
 */
function deleteFile(fileName: string, folderName: string) {
  const filePath = path.join("protected", folderName, fileName);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    // Delete file
    fs.unlinkSync(filePath);
    return true;
  }
}

/**
 *Check if array consists duplicate values
 * @param {any[]} arr - Array to check
 * @return {boolean}
 */
function hasDuplicates(arr: any[]) {
  const valuesSoFar = Object.create(null);
  for (let i = 0; i < arr.length; ++i) {
    const value = arr[i];
    if (value in valuesSoFar) {
      return true;
    }
    valuesSoFar[value] = true;
  }

  return false;
}

function generateReference(suffix?: string): string {
  let reference = `${new Date().getTime().toString()}`;
  if (suffix) `${reference}-${suffix}`;
  return reference;
}

function numberShortener(value: number): string {
  const units = ["", "K", "M", "B", "T"];
  let i = 0;
  while (Number(value) >= 1000 && i < units.length - 1) {
    value /= 1000;
    i++;
  }
  const arr = String(value).split(".");
  if (arr.length > 1 && String(arr[1]).length > 1) {
    return `${Number(value).toFixed(2)}${units[i]}`;
  }
  return `${Number(value)}${units[i]}`;
}

const nairaSymbol = "₦";

async function verifyGoogleToken(
  tokenId: string
): Promise<TokenPayload | undefined> {
  const client = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret
  );

  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: config.google.clientId,
  });

  const payload = ticket.getPayload();

  return payload;
}

function shuffle(param: any[]) {
  const arr = [...param];

  return arr
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
}

function chooseIndex(max: number): number {
  return Math.floor(Math.random() * max);
}

function sortByAsc(items: any[], property: string): any[] {
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length - i - 1; j++) {
      if (items[j][property] > items[j + 1][property]) {
        [items[j], items[j + 1]] = [items[j + 1], items[j]];
      }
    }
  }
  return items;
}

function sortByDsc(items: any[], property: string): any[] {
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length - i - 1; j++) {
      if (items[j + 1][property] > items[j][property]) {
        [items[j + 1], items[j]] = [items[j], items[j + 1]];
      }
    }
  }
  return items;
}

const algorithm = "aes-256-cbc";
function encryptData(payload: any, key: string): string {
  const iv = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex")
    .substring(0, 16);
  const derivedKey = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex")
    .substring(0, 32);
  const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);
  const encryptedText =
    cipher.update(payload, "utf8", "hex") + cipher.final("hex");
  return encryptedText;
}

function decryptData(encryptedText: string, key: string): string {
  const iv = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex")
    .substring(0, 16);
  const derivedKey = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex")
    .substring(0, 32);
  const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);
  const decryptData =
    decipher.update(encryptedText, "hex", "utf8") + decipher.final("utf8");
  return decryptData;
}

function jsonParser(str: any, to: "json" | "string") {
  if (typeof str !== "object" && to === "json") {
    return JSON.parse(str);
  }

  if (typeof str !== "string" && to === "string") {
    return JSON.stringify(str, null, 2);
  }
  return str;
}

const getCountries = () => countries;

async function getGoogleAccessToken() {
  const MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
  const SCOPES = [MESSAGING_SCOPE];
  const key: IGoogleServiceAccount = require("../../fcm.json");
  const client = await new JWT(
    key.client_email,
    undefined,
    key.private_key,
    SCOPES,
    undefined
  );

  const res = await client.authorize();
  return res.access_token!;
}

export {
  capitalize,
  chooseIndex,
  comparePassword,
  createToken,
  decryptData,
  deleteFile,
  encryptData,
  generateOTP,
  generatePassword,
  generateReference,
  generateReferralCode,
  getCountries,
  getFileContent,
  getGoogleAccessToken,
  getIPInfo,
  groupBy,
  handleApiError,
  hasDuplicates,
  hashPassword,
  hasWhiteSpace,
  inputValidation,
  isBase64Image,
  isDisabled,
  isLocked,
  isRestricted,
  isValidEmail,
  isValidPhoneNumber,
  jsonParser,
  jwtDecoder,
  jwtEncoder,
  nairaSymbol,
  numberShortener,
  recordExists,
  removeSensitiveData,
  shuffle,
  sortByAsc,
  sortByDsc,
  stripTags,
  validateAuthorization,
  verifyGoogleToken,
};
