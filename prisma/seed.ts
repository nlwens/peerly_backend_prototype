import { PrismaClient } from '../generated/prisma/client';
import { edu_level, request_type, request_status } from '../generated/prisma/enums';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.study_sessions.deleteMany();
  await prisma.requests.deleteMany();
  await prisma.users.deleteMany();

  // Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create users
  const wen = await prisma.users.create({
    data: {
      name: 'Wen',
      email: 'wen@gmail.com',
      password_hash: passwordHash,
      major: 'HBO-ICT',
      education_level: edu_level.HBO,
      strengths: 'Mathematics, Java Programming',
      needs_help_with: 'English writing',
      description: 'I love coding and helping others with math.',
      token_balance: 3,
    },
  });

  const nhien = await prisma.users.create({
    data: {
      name: 'Nhien',
      email: 'nhien@gmail.com',
      password_hash: passwordHash,
      major: 'English Literature',
      education_level: edu_level.HBO,
      strengths: 'English writing, React Native',
      needs_help_with: 'Java Programming, Statistics',
      description: 'Writer looking to learn programming basics.',
      token_balance: 5,
    },
  });

  const carol = await prisma.users.create({
    data: {
      name: 'Carol',
      email: 'carol@gmail.com',
      password_hash: passwordHash,
      major: 'Data Science',
      education_level: edu_level.Master_WO,
      strengths: 'Statistics, Python Programming',
      needs_help_with: 'Web development',
      description: 'Data scientist wanting to learn frontend dev.',
      token_balance: 8,
    },
  });

  console.log('Created users:', wen.name, nhien.name, carol.name);

  // Create requests
  const request1 = await prisma.requests.create({
    data: {
      requester_id: nhien.id,
      receiver_id: wen.id,
      subject: 'Help with Java basics',
      type: request_type.REQUEST,
      scheduled_datetime: new Date('2026-04-01T14:00:00'),
      status: request_status.ACCEPTED,
    },
  });

  const request2 = await prisma.requests.create({
    data: {
      requester_id: carol.id,
      receiver_id: nhien.id,
      subject: 'Essay writing review',
      type: request_type.REQUEST,
      scheduled_datetime: new Date('2026-04-05T10:00:00'),
      status: request_status.PENDING,
    },
  });

  const request3 = await prisma.requests.create({
    data: {
      requester_id: carol.id,
      receiver_id: wen.id,
      subject: 'React and TypeScript tutoring',
      type: request_type.REQUEST,
      scheduled_datetime: new Date('2026-04-10T16:00:00'),
      status: request_status.ACCEPTED,
    },
  });

  console.log('Created requests');

  // Create study sessions for accepted requests
  await prisma.study_sessions.create({
    data: {
      request_id: request1.id,
      scheduled_datetime: new Date('2026-04-01T14:00:00'),
      requester_completed: false,
      receiver_completed: false,
    },
  });

  await prisma.study_sessions.create({
    data: {
      request_id: request3.id,
      scheduled_datetime: new Date('2026-04-10T16:00:00'),
      requester_completed: false,
      receiver_completed: false,
    },
  });

  console.log('Created study sessions');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });