import { sql } from "@vercel/postgres";
import { validate } from "deep-email-validator";

export default async function handler(request, response) {
  if (request.method === "GET") {
    const authheader = request.headers.authorization;
    if (authheader) {
      const auth = new Buffer.from(authheader.split(" ")[1], "base64").toString().split(":");
      const user = auth[0];
      const pass = auth[1];
      if (user == "admin" && pass == process.env.SUBS_PASSWORD) {
        const result = await sql`SELECT * FROM Emails;`;
        return response.status(200).json({ result });
      } else {
        response.setHeader("WWW-Authenticate", "Basic");
        return response.status(401).end();
      }
    } else {
      response.setHeader("WWW-Authenticate", "Basic");
      return response.status(401).end();
    }
  } else if (request.method === "POST") {
    if (!request.body.email) {
      return response.status(400).json({ message: "missing email address" });
    }
    const validation = await validate({
      email: request.body.email,
      validateRegex: true,
      validateMx: true,
      validateTypo: false,
      validateDisposable: true,
      validateSMTP: false,
    });
    console.log(validation);
    if (!validation.valid) {
      return response.status(400).json({ message: "email not valid" });
    }
    const result = await sql`INSERT INTO Emails VALUES ( ${request.body.email} );`;
    return response.status(201).send();
  }
  return response.status(404).send();
}
