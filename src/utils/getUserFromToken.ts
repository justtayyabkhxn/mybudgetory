import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

interface JwtPayload {
  id: string;
  // Add more fields if your token has them (e.g., email, role, etc.)
}


export async function getUserFromToken(req: Request) {
  await dbConnect();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password");
    return user || null;
  } catch {
    return null;
  }
}
