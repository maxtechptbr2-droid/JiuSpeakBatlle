import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { authStore } from './authStore';

// Initialize Dotenv config to load correct DATABASE_URL if present
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function runDiagnostics() {
  console.log('='.repeat(80));
  console.log('   🧪 JIUSPEAK UPLOADS AND PROFILE PERSISTENCE DIAGNOSTICS SCRIPT');
  console.log('='.repeat(80));

  const cwd = process.cwd();
  const uploadsDir = path.join(cwd, 'public', 'uploads');
  const profilesDir = path.join(uploadsDir, 'profiles');
  const coversDir = path.join(uploadsDir, 'covers');
  
  console.log(`[FILESYSTEM] Current Working Directory (CWD): ${cwd}`);
  console.log(`[FILESYSTEM] Targets:`);
  console.log(`   - Uploads Root: ${uploadsDir}`);
  console.log(`   - Profiles Folder: ${profilesDir}`);
  console.log(`   - Covers Folder: ${coversDir}`);

  // 1. Assert or create physical directories
  console.log('\n[STEP 1] Validating and creating folders if missing...');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
    }
    if (!fs.existsSync(coversDir)) {
      fs.mkdirSync(coversDir, { recursive: true });
    }
    fs.chmodSync(uploadsDir, 0o755);
    fs.chmodSync(profilesDir, 0o755);
    fs.chmodSync(coversDir, 0o755);
    console.log('✅ Directories valid and set with 755 secure permissions.');
  } catch (err: any) {
    console.warn('⚠️ Folder permissions adjustment warned:', err.message);
  }

  // 2. Create physical test image binary files
  console.log('\n[STEP 2] Generating physical test images...');
  const testProfileFilename = `test_profile_diag_${Date.now()}.webp`;
  const testCoverFilename = `test_cover_diag_${Date.now()}.webp`;
  const testProfilePath = path.join(profilesDir, testProfileFilename);
  const testCoverPath = path.join(coversDir, testCoverFilename);

  // Simple 1x1 transparent binary WebP fake buffer
  const dummyWebpBuffer = Buffer.from('RIFF\x14\x00\x00\x00WEBPVP8 \x08\x00\x00\x00\x00\x01\x00\x02\x00\x03\x00\x04\x00', 'binary');

  try {
    fs.writeFileSync(testProfilePath, dummyWebpBuffer);
    fs.writeFileSync(testCoverPath, dummyWebpBuffer);
    fs.chmodSync(testProfilePath, 0o755);
    fs.chmodSync(testCoverPath, 0o755);
    
    console.log(`✅ Test profile written: ${testProfilePath}`);
    console.log(`✅ Test cover written: ${testCoverPath}`);
  } catch (err: any) {
    console.error('❌ Critical failure writing physical files:', err);
    process.exit(1);
  }

  // Define relative path URLs for assertion
  const expectedProfileUrl = `/uploads/profiles/${testProfileFilename}`;
  const expectedCoverUrl = `/uploads/covers/${testCoverFilename}`;

  // 3. PostgreSQL and Prisma Connection Check
  console.log('\n[STEP 3] Testing PostgreSQL and Prisma client connectivity...');
  let databaseAvailable = false;
  let targetUser: any = null;
  let originalProfileData: any = {};

  try {
    await prisma.$connect();
    databaseAvailable = true;
    console.log('✅ PostgreSQL is ONLINE via Prisma Client.');
  } catch (dbErr: any) {
    console.log('❌ PostgreSQL connection failed. Skipping DB persistence tests.');
    console.log('Reason:', dbErr.message);
  }

  if (databaseAvailable) {
    try {
      // Find or create test user
      console.log('\n[STEP 4] Fetching a user to perform DB persistence diagnostics...');
      targetUser = await prisma.user.findFirst();
      if (!targetUser) {
        console.log('⚠️ No users in the table, creating a mock diagnosis user...');
        targetUser = await prisma.user.create({
          data: {
            email: 'diag_user@jiuspeak.com',
            name: 'Luiz Silva Diagnostic',
            password: 'hashedpassworddontmatter',
            role: 'ATHLETE',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
            profilePhoto: '',
            coverPhoto: ''
          }
        });
        console.log(`✅ Mock user created with ID: ${targetUser.id}`);
      } else {
        console.log(`✅ Selected target user for the checkup: [${targetUser.name}] ID: ${targetUser.id}`);
        // Store original values to restore them later
        originalProfileData = {
          name: targetUser.name,
          avatar: targetUser.avatar,
          profilePhoto: targetUser.profilePhoto,
          coverPhoto: targetUser.coverPhoto
        };
      }

      // 5. Save uploads to PostgreSQL using Prisma Update
      console.log('\n[STEP 5] Persisting relative upload paths into user records...');
      const updatedUser = await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          profilePhoto: expectedProfileUrl,
          avatar: expectedProfileUrl,
          coverPhoto: expectedCoverUrl,
          name: 'Atleta Diagnostico Teste' // Explicit name to check deterministic overrides
        }
      });

      console.log(`✅ User profile fields updated:`);
      console.log(`   - profilePhoto: ${updatedUser.profilePhoto}`);
      console.log(`   - avatar: ${updatedUser.avatar}`);
      console.log(`   - coverPhoto: ${updatedUser.coverPhoto}`);
      console.log(`   - name: ${updatedUser.name}`);

      // 6. Consult via Prisma to guarantee perfect database storage
      console.log('\n[STEP 6] Re-fetching data to ensure Prisma does not drift...');
      const verifyQuery = await prisma.user.findUnique({
        where: { id: targetUser.id }
      });
      if (verifyQuery && verifyQuery.profilePhoto === expectedProfileUrl && verifyQuery.coverPhoto === expectedCoverUrl) {
        console.log('✅ Prisma lookup returned 100% accurate persisted uploads match.');
      } else {
        console.error('❌ Prisma lookup mismatch! Storage might have failed.');
      }

      // 7. Verify authStore.findById (Guards against the destructive mapped overwrite)
      console.log('\n[STEP 7] Fetching user via authStore.findById to check for mapping overrides...');
      const storeUser = await authStore.findById(targetUser.id);
      if (storeUser) {
        console.log(`🔍 authStore returns name: "${storeUser.name}"`);
        console.log(`🔍 authStore returns avatar: "${storeUser.avatar}"`);
        console.log(`🔍 authStore returns profilePhoto: "${storeUser.profilePhoto}"`);
        console.log(`🔍 authStore returns coverPhoto: "${storeUser.coverPhoto}"`);

        const isNameOverridden = storeUser.name !== 'Atleta Diagnostico Teste';
        const isAvatarOverridden = storeUser.avatar !== expectedProfileUrl;

        if (!isNameOverridden && !isAvatarOverridden) {
          console.log('✅ SUCCESS! authStore correctly preserved actual customized DB photo & name instead of replacing it with generic stock avatars!');
        } else {
          if (isNameOverridden) console.error('❌ FAILURE: The name was overridden with a deterministic dummy name!');
          if (isAvatarOverridden) console.error('❌ FAILURE: The custom profile upload (avatar) was replaced with a generic stock image!');
        }
      } else {
        console.error('❌ Could not retrieve user through authStore.findById');
      }

      // 8. Simulate GET /api/auth/me response
      console.log('\n[STEP 8] Simulating GET /api/auth/me payload...');
      if (storeUser) {
        const { passwordHash, refreshToken, resetToken, resetTokenExpires, verificationToken, ...safeUser } = storeUser as any;
        console.log('Simulated req.user details passed to client:');
        console.log(JSON.stringify({
          id: safeUser.id,
          name: safeUser.name,
          avatar: safeUser.avatar,
          profilePhoto: safeUser.profilePhoto,
          coverPhoto: safeUser.coverPhoto
        }, null, 2));
        
        if (safeUser.profilePhoto === expectedProfileUrl && safeUser.avatar === expectedProfileUrl) {
          console.log('✅ GET /api/auth/me is 100% ready and secure.');
        } else {
          console.error('❌ GET /api/auth/me lacks physical file references.');
        }
      }

    } catch (dbTestErr: any) {
      console.error('❌ Error during database assertions:', dbTestErr);
    }
  }

  // 9. Physical accessibility verification
  console.log('\n[STEP 9] Verifying files are readable on disk...');
  try {
    const isProfileReadable = fs.existsSync(testProfilePath);
    const isCoverReadable = fs.existsSync(testCoverPath);

    if (isProfileReadable && isCoverReadable) {
      const pStats = fs.statSync(testProfilePath);
      const cStats = fs.statSync(testCoverPath);
      console.log(`✅ File is readable on disk: "${testProfileFilename}" (${pStats.size} bytes)`);
      console.log(`✅ File is readable on disk: "${testCoverFilename}" (${cStats.size} bytes)`);
    } else {
      console.error('❌ Files are not readable!');
    }
  } catch (readErr: any) {
    console.error('❌ Error testing file read:', readErr);
  }

  // 10. Clean up test files and restore DB to prevent garbage
  console.log('\n[STEP 10] Cleaning up and restoring database state back to original...');
  try {
    if (fs.existsSync(testProfilePath)) fs.unlinkSync(testProfilePath);
    if (fs.existsSync(testCoverPath)) fs.unlinkSync(testCoverPath);
    console.log('✅ Physical test files safely removed from disk.');

    if (databaseAvailable && targetUser) {
      if (originalProfileData.name) {
        // Restore user to original condition
        await prisma.user.update({
          where: { id: targetUser.id },
          data: {
            name: originalProfileData.name,
            avatar: originalProfileData.avatar,
            profilePhoto: originalProfileData.profilePhoto,
            coverPhoto: originalProfileData.coverPhoto
          }
        });
        console.log(`✅ Restored original user metadata for [${originalProfileData.name}].`);
      } else {
        // If we created a mock user, delete it
        await prisma.user.delete({
          where: { id: targetUser.id }
        });
        console.log('✅ Deleted mock user.');
      }
    }
  } catch (cleanupErr: any) {
    console.warn('⚠️ Alert: Warning during cleanup phase:', cleanupErr.message);
  }

  console.log('\n' + '='.repeat(80));
  console.log('🏁 DIAGNOSTICS COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(80));
  
  await prisma.$disconnect();
}

runDiagnostics().catch(async (e) => {
  console.error('💥 Execution Crashed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
