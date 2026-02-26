import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vsu.edu.ph' },
    update: {},
    create: {
      email: 'admin@vsu.edu.ph',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      contactNumber: '+639001234567',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create Guard
  const guardPassword = await bcrypt.hash('guard123', 12);
  const guard = await prisma.user.upsert({
    where: { email: 'guard@vsu.edu.ph' },
    update: {},
    create: {
      email: 'guard@vsu.edu.ph',
      password: guardPassword,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      role: 'GUARD',
      contactNumber: '+639001234568',
    },
  });
  console.log(`✅ Guard created: ${guard.email}`);

  // Create Student
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@vsu.edu.ph' },
    update: {},
    create: {
      email: 'student@vsu.edu.ph',
      password: studentPassword,
      firstName: 'Maria',
      lastName: 'Santos',
      role: 'STUDENT',
      contactNumber: '+639001234569',
    },
  });
  console.log(`✅ Student created: ${student.email}`);

  // Create Faculty
  const facultyPassword = await bcrypt.hash('faculty123', 12);
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@vsu.edu.ph' },
    update: {},
    create: {
      email: 'faculty@vsu.edu.ph',
      password: facultyPassword,
      firstName: 'Jose',
      lastName: 'Rizal',
      role: 'FACULTY',
      contactNumber: '+639001234570',
    },
  });
  console.log(`✅ Faculty created: ${faculty.email}`);

  console.log('\n🎉 Seeding complete!');
  console.log('\nDefault credentials:');
  console.log('  Admin:   admin@vsu.edu.ph   / admin123');
  console.log('  Guard:   guard@vsu.edu.ph   / guard123');
  console.log('  Student: student@vsu.edu.ph / student123');
  console.log('  Faculty: faculty@vsu.edu.ph / faculty123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
