// import { NextResponse, NextRequest } from "next/server";
// import { db } from "@/app/lib/prisma";

// export async function GET(req: Request, { params }: { params: { id: string } } ){
//     try {
//       console.log('-----------------------------------------')
//       const schoolData = await db.users.findMany({
//         where: {
//           contestId: params.id
//         }
//       });

//       return NextResponse.json(registrations, { status: 200 });

//     } catch (error:any) {
//       console.error("error");
//       console.error("--------------------");
//       return NextResponse.json({ error: error.message }, { status: 500 });

//     }
//   } 