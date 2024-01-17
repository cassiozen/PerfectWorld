import { Database } from "bun:sqlite";
import { validate } from "deep-email-validator";

const server = Bun.serve({
  async fetch(req) {
    const db = new Database("perfectworld.sqlite");
    const url = new URL(req.url);
    const authheader = req.headers.get("authorization");

    if (req.method === "GET") {
      if (authheader) {
        const auth = Buffer.from(authheader.split(" ")[1], "base64").toString().split(":");
        const user = auth[0];
        const pass = auth[1];
        if (user == "admin" && pass == process.env.SUBS_PASSWORD) {
          const result = db.query(`SELECT * FROM Emails;`).all();
          return Response.json(result);
        } else {
          return new Response(undefined, { headers: { "WWW-Authenticate": "Basic" }, status: 401 });
        }
      } else {
        return new Response(undefined, { headers: { "WWW-Authenticate": "Basic" }, status: 401 });
      }
    } else if (req.method === "POST") {
      const formdata = await req.formData();

      const validation = await validate({
        email: formdata.get("email") as string,
        validateRegex: true,
        validateMx: true,
        validateTypo: false,
        validateDisposable: true,
        validateSMTP: false,
      });
      if (!validation.valid) {
        return Response.json({ message: "email not valid" }, { status: 400 });
      }
      const result = db.query(`INSERT INTO Emails VALUES ( "${formdata.get("email") as string}" );`).run();
      return new Response();
    }
    return new Response("404!", { status: 404 });
  },
});

console.log(`Listening on ${server.url}`);
