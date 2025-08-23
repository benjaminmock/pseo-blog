import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/config";
import EditProfileForm from "./_components/EditProfileForm";
import { prisma } from "@/lib/prisma";

// Function to get trainer data for a user by email
async function getTrainerByEmail(email: string) {
  const stmt = db.prepare(`
    SELECT * FROM Trainers
    WHERE email = ?
  `);
  return stmt.get(email) as
    | {
        trainer_id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string | null;
        bio: string | null;
        link: string | null;
      }
    | undefined;
}

// Function to get user data from Prisma
async function getUserData(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Get user data from Prisma
  const userData = await getUserData(user.id);

  let trainerData = null;
  if (user.email) {
    trainerData = (await getTrainerByEmail(user.email)) || null;
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-light mb-8 text-gray-900">Mein Profil</h1>

      <div className="bg-white rounded-lg p-6">
        <EditProfileForm user={userData} trainer={trainerData} />
      </div>
    </main>
  );
}

export const metadata = {
  title: "Mein Profil",
  description: "Profil bearbeiten",
};
