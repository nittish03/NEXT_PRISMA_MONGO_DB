    import connectDb from "@/mongoDb/connectDb";
    import * as dotenv from 'dotenv';
    import { NextRequest, NextResponse } from "next/server";
    import bcryptjs from "bcryptjs";
    import { prismaDB } from "@/lib/prismaDB";

    dotenv.config();
    connectDb();

    export async function POST(request: NextRequest) {
      try {
        await prismaDB.$connect(); // Ensure Prisma connects within the handler
    
        const reqBody = await request.json();
        const { username, email, password } = reqBody;
    
        if (!username || !email || !password) {
          return NextResponse.json(
            { error: "Missing value name, email, or password" },
            { status: 422 }
          );
        }
    
        // Check if the user already exists
        const userExist = await prismaDB.user.findUnique({
          where: { email },
        });
    
        if (userExist) {
          return NextResponse.json(
            { error: "User already exists" },
            { status: 400 }
          );
        }
    
        // Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
    
        // Save the user in the database
        await prismaDB.user.create({
          data: {
            name: username,
            email: email,
            hashedPassword: hashedPassword,
          },
        });
    
        return NextResponse.json(
          {
            message: "User created successfully",
            success: true,
          },
          { status: 201 }
        );
      } catch (error: any) {
        console.error("Error in POST handler:", error); // Log the error for debugging
        return NextResponse.json(
          { error: error.message || "Internal Server Error" },
          { status: 500 }
        );
      }
    }