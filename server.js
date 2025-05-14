/* *****************************************************************
  DISCLAIMER: This code is developed to support education and demo 
  purposes and certain simplifications have been made to keep the code
  short and comprehensible. (ES6 module) - from IWP
  ****************************************************************** */

import http from 'http';
import fs from "fs";
import path  from "path";
import process from "process";

//import contentType from "content-type";
//import url from "url";
//import qs from "querystring";
import { processReq, ValidationError, NoResourceError } from "./router.js";
export { startServer, extractJSON, extractForm, fileResponse, htmlResponse, jsonResponse, errorResponse, reportError };

// Hostname and port.
const hostname = 'localhost';
const port = 3000; // Change port depending on which port the server should run on using the IWP server.

// Localhost server.
const serverName = "http://localhost:3000";

// Offical IWP server.
//const serverName="https://cs-25-dat-2-03.p2datsw.cs.aau.dk:3230";


/* ***************************************************************************  
  First a number of generic helper functions to serve basic files and documents 
 ***************************************************************************** */ 


/* ***                 Setup Serving of files ***                  */ 

const publicResources = "/public";
// Secture file system access as described on: https://nodejs.org/en/knowledge/file-system/security/introduction/
const rootFileSystem = process.cwd();

function securePath(userPath){
  if (userPath.indexOf('\0') !== -1) {
    // Could also test for illegal chars: if (!/^[a-z0-9]+$/.test(filename)) {return undefined;}
    return undefined;
  }

  userPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');
  userPath = publicResources + userPath;

  let p = path.join(rootFileSystem, path.normalize(userPath)); 
  //console.log("The path is:"+p);
  return p;
}
/**
 * Sends the contents of a file as the HTTP response.
 * @param {http.ServerResponse} res - The HTTP response object to send the file data to.
 * @param {string} filename - The relative path of the file requested, used to locate and read the file.
 */
function fileResponse(res, filename){
  const sPath = securePath(filename);
  console.log("Reading:" + sPath);
  fs.readFile(sPath, (err, data) => {
    if (err) {
      console.error(err);
      errorResponse(res, 404, String(err));
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', guessMimeType(filename));
      res.write(data);
      res.end('\n');
    }
  })
}

/**
 * A helper function that converts filename suffix to the corresponding HTTP content type.
 * Better alternative: use require('mmmagic') library.
 * 
 * @param {*} fileName - The relative path of the file requested, used to locate and read the file.
 * @returns {String} - If its not incomplete it returns the correct Mimetype for the extension, if not it returns plain text.
 */
function guessMimeType(fileName) {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  console.log(fileExtension);
  const ext2Mime = { // Aught to check with IANA spec
    "txt": "text/txt",
    "html": "text/html",
    "ico": "image/ico", // CHECK x-icon vs image/vnd.microsoft.icon
    "js": "text/javascript",
    "json": "application/json", 
    "css": 'text/css',
    "png": 'image/png',
    "jpg": 'image/jpeg',
    "wav": 'audio/wav',
    "mp3": 'audio/mpeg',
    "svg": 'image/svg+xml',
    "pdf": 'application/pdf',
    "doc": 'application/msword',
    "docx": 'application/msword'
   };
  // Incomplete
  return (ext2Mime[fileExtension] || "text/plain");
}

// Helper functions to retrieve request objects and send response objects
const InternalError = "Internal Error";

/* send a response with htmlString as html page */
function htmlResponse(res, htmlString){
  res.statusCode = 200;
  res.setHeader('Content-Type', "text/html");
  res.write(htmlString);
  res.end('\n');
}

/* send a response with a given HTTP error code, and reason string */ 
function errorResponse(res, code, reason){
  res.statusCode=code;
  res.setHeader('Content-Type', 'text/txt');
  res.write(reason);
  res.end("\n");
}
/* send 'obj' object as JSON as response */
function jsonResponse(res,obj){
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(obj));
  res.end('\n');
}

/* As the body of a POST may be long the HTTP modules streams chunks of data
   that must first be collected and appended before the data can be operated on. 
   This function collects the body and returns a promise for the body data
*/

/* protect againts DOS attack from malicious user sending an very very large post body.
if (body.length > 1e7) { 
  // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
  request.connection.destroy();
}
*/
const MessageTooLongError="MsgTooLong";
function collectPostBody(req){
  //the "executor" function
 function collectPostBodyExecutor(resolve,reject){
    let bodyData = [];
    let length=0;
    req.on('data', (chunk) => {
      bodyData.push(chunk);
      length+=chunk.length; 
 
      if (length > 10000000) { //10 MB limit!
        req.connection.destroy(); //we would need the response object to send an error code
        reject(new Error(MessageTooLongError));
      }
    }).on('end', () => {
    bodyData = Buffer.concat(bodyData).toString(); //By default, Buffers use UTF8
    console.log(bodyData);
    resolve(bodyData); 
    });
    //Exceptions raised will reject the promise
  }
  return new Promise(collectPostBodyExecutor);
}

/* extract the enclosed JSON object in body of a POST to JavaScript Object */ 
/* Aught also to check that Content-Type is application/json before parsing*/
function extractJSON(req){
  if(isJsonEncoded(req.headers['content-type']))
   return collectPostBody(req).then(body=> {
     let x = JSON.parse(body);
     return x;
  });
  else
    return Promise.reject(new Error(ValidationError)); //create a rejected promise
}

/** extract the enclosed forms data in the pody of POST
 * @param {http.IncomingMessage} req - The HTTP request object containing the POST body and headers.
 * @return {Promise<URLSearchParams>} - A promise that resolves to a URLSearchParams object representing the form data,
 *                                    or rejects with a ValidationError if the content type is incorrect.
 */
function extractForm(req) {
  if (isFormEncoded(req.headers['content-type']))
    return collectPostBody(req).then(body => {
      //const data = qs.parse(body);//LEGACY
       //console.log(data);
       let data = new URLSearchParams(body);
      return data;
      });
  else
    return Promise.reject(new Error(ValidationError));  //create a rejected promise
}

function isFormEncoded(contentType){
  //Format 
  //Content-Type: text/html; charset=UTF-8
  let ctType=contentType.split(";")[0];
  ctType = ctType.trim();
  return (ctType === "application/x-www-form-urlencoded"); 
  // would be more robust to use the content-type module and  contentType.parse(..)
  // Fine for demo purposes
}

/**
 * Checks whether the provided Content-Type indicates JSON encoding.
 * 
 * @param {string} contentType - The value of the Content-Type header from an HTTP request.
 * @returns {boolean} - Returns true if the content type is 'application/json', false otherwise.
 */
function isJsonEncoded(contentType) {
  //Format 
  //Content-Type: application/json; encoding
  let ctType = contentType.split(";")[0];
  ctType = ctType.trim();
  return (ctType === "application/json"); 
  // would be more robust to use the content-type module and contentType.parse(..)
}

/**
 * Handles and reports errors by sending appropriate HTTP responses.
 * 
 * @param {http.ServerResponse} res - The HTTP response object
 * @param {Error} error - The error object to handle and report
 */
function reportError(res, error) {
  if (error.message === ValidationError) {
    return errorResponse(res, 400, error.message);
  }
  if (error.message === NoResourceError) {
    return errorResponse(res, 404, error.message);
  }
  else {
    console.log(InternalError + ": " + error);
    return errorResponse(res, 500, "");
  }
}

/* *********************************************************************
   Setup HTTP server and route handling 
   ******************************************************************** */
const server = http.createServer(requestHandler);
/**
 * Handles incoming HTTP requests and delegates to routing logic.
 * 
 * @param {http.IncomingMessage} req - The incoming HTTP request
 * @param {http.ServerResponse} res - The HTTP response to send back
 */
function requestHandler(req, res) {
  try {
    processReq(req, res);
  } catch(e) {
    console.log(InternalError + "!!: " + e);
    errorResponse(res, 500, "");
  }
}

/**
 * Function too start the server
 */
function startServer() {
  server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  fs.writeFileSync('message.txt', `Server running at http://${hostname}:${port}/`);
 });
}