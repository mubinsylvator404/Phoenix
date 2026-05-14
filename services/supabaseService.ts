
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gkycpsiqzwtbnomrnpog.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWNwc2lxend0Ym5vbXJucG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzQwNjYsImV4cCI6MjA4NzAxMDA2Nn0.ijOH4UnQ8k9ODCHRfd0bgqAR4DNAgK_pHVHK4kwy078';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Signs up a new user in Supabase Auth and returns the user data.
 */
export const signUpUser = async (email: string, password: string, metadata: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  if (error) throw error;
  return data;
};

/**
 * Signs in a user using Supabase Auth.
 */
export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * Persists data to Supabase using upsert with retry logic.
 */
export const syncData = async (table: string, data: any | any[], retries = 3, delay = 1000) => {
  try {
    if (!data) return;
    const payload = Array.isArray(data) ? data : [data];
    if (payload.length === 0) return;
    
    console.log(`[Supabase] Syncing ${table}...`, payload.length, "items");
    
    const attemptSync = async (currentRetry: number): Promise<void> => {
      try {
        // Prepare payload with potential column mappings
        const mappedPayload = payload.map(item => {
          const newItem = { ...item };
          
          // Log payload size if it's large
          const payloadSize = JSON.stringify(newItem).length;
          if (payloadSize > 100000) { // 100KB
            console.warn(`[Supabase] Large payload detected for ${table} (ID: ${item.id}): ${Math.round(payloadSize/1024)}KB`);
          }
          
          // Ensure ID is a valid UUID for Supabase
          if (newItem.id && typeof newItem.id === 'string' && !newItem.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // If it's not a valid UUID, we'll keep it for now but the atomic sync will handle it if it fails
            // Actually, let's try to be proactive if we know it's a legacy ID
            if (newItem.id.startsWith('t-') || newItem.id.startsWith('s-') || newItem.id.startsWith('c-') || newItem.id.startsWith('e-') || newItem.id.startsWith('v-')) {
               // We don't replace it here because we might lose the reference in the local state
               // The atomic sync is the safer place to handle this
            }
          }
          
          // Mapping for video_classes
          if (table === 'video_classes') {
            if (newItem.youtubeUrl) {
              newItem.youtube_url = newItem.youtubeUrl;
              delete (newItem as any).youtubeUrl;
            }
            // Ensure thumbnail is handled if it exists in schema
            if (newItem.thumbnail) {
              // If thumbnail exists in schema, it will be kept, otherwise stripped by atomic sync
            }
          }
          
          // Mapping for notices
          if (table === 'notices') {
            if (newItem.facultyId) { newItem.faculty_id = newItem.facultyId; delete (newItem as any).facultyId; }
            if (newItem.createdAt) { newItem.created_at = newItem.createdAt; delete (newItem as any).createdAt; }
          }

          // Mapping for teachers
          if (table === 'teachers') {
            // Map education to database columns if it exists
            if (newItem.education !== undefined) {
              newItem.academic_background = newItem.education;
              newItem.educational_background = newItem.education;
            }
            
            if (newItem.profileType) { newItem.profile_type = newItem.profileType; delete (newItem as any).profileType; }
            if (newItem.profileContent) { newItem.profile_content = newItem.profileContent; delete (newItem as any).profileContent; }

            // Ensure all fields have defaults to prevent nulls in state
            newItem.name = newItem.name || '';
            newItem.subject = newItem.subject || '';
            newItem.qualification = newItem.qualification || '';
            newItem.experience = newItem.experience || '';
            newItem.image = newItem.image || '';
            newItem.email = newItem.email || '';
            newItem.password = newItem.password || '';
            
            // Remove camelCase versions to avoid Supabase errors if columns don't exist
            delete (newItem as any).education;
          }
          
          // Mapping for subjects (if "class" refers to subjects)
          if (table === 'subjects') {
            if (newItem.assignedTeachers) { newItem.assigned_teachers = newItem.assignedTeachers; delete (newItem as any).assignedTeachers; }
            if (newItem.paymentType) { newItem.payment_type = newItem.paymentType; delete (newItem as any).paymentType; }
            if (newItem.classesPerWeek) { newItem.classes_per_week = newItem.classesPerWeek; delete (newItem as any).classesPerWeek; }
            if (newItem.subSubjects) { newItem.sub_subjects = newItem.subSubjects; delete (newItem as any).subSubjects; }
          }

          // Mapping for students
          if (table === 'students') {
            if (newItem.feeRecords && newItem.feeRecords.length > 0) {
              console.log(`[Supabase] Syncing ${newItem.feeRecords.length} fee records for student: ${newItem.name || newItem.id}`);
            }
            // Ensure all payment fields are mapped and initialized
            newItem.subject_payments = newItem.subjectPayments || {};
            newItem.subject_payment_types = newItem.subjectPaymentTypes || {};
            newItem.subject_enrollment_dates = newItem.subjectEnrollmentDates || {};
            newItem.monthly_payments = newItem.monthlyPayments || {};
            newItem.fee_records = newItem.feeRecords || newItem.fee_records || [];
            newItem.course_fee_status = newItem.courseFeeStatus || 'Due';
            newItem.monthly_fee_status = newItem.monthlyFeeStatus || 'Due';
            
            // Attendance mapping - ensure it's robust
            newItem.attendance = newItem.attendance !== undefined ? newItem.attendance : 0;
            const attData = newItem.dailyAttendance || newItem.daily_attendance || {};
            newItem.dailyAttendance = attData;
            newItem.daily_attendance = attData;

            console.log(`[Supabase] Mapping student ${newItem.name || newItem.id}: attendance=${newItem.attendance}, daily_attendance_keys=${Object.keys(attData).length}`);

            // Clean up other camelCase versions but keep dailyAttendance for compatibility
            delete (newItem as any).subjectPayments;
            delete (newItem as any).subjectPaymentTypes;
            delete (newItem as any).subjectEnrollmentDates;
            delete (newItem as any).monthlyPayments;
            delete (newItem as any).feeRecords;
            delete (newItem as any).courseFeeStatus;
            delete (newItem as any).monthlyFeeStatus;
            
            // Map assignmentSubmissions to snake_case for Supabase
            if (newItem.assignmentSubmissions) {
              newItem.assignment_submissions = newItem.assignmentSubmissions;
              delete (newItem as any).assignmentSubmissions;
            }

            if (newItem.sscRoll) { newItem.ssc_roll = newItem.sscRoll; delete (newItem as any).sscRoll; }
            if (newItem.sscReg) { newItem.ssc_reg = newItem.sscReg; delete (newItem as any).sscReg; }
            if (newItem.ownPhone) { newItem.own_phone = newItem.ownPhone; delete (newItem as any).ownPhone; }
            if (newItem.guardianPhone) { newItem.guardian_phone = newItem.guardianPhone; delete (newItem as any).guardianPhone; }
            if (newItem.averageScore !== undefined) { newItem.average_score = newItem.averageScore; delete (newItem as any).averageScore; }

            if (newItem.isVerified !== undefined) { newItem.is_verified = newItem.isVerified; delete (newItem as any).isVerified; }
            if (newItem.joinDate) { newItem.join_date = newItem.joinDate; delete (newItem as any).joinDate; }
            
            // Ensure password is explicitly included if it exists
            if (newItem.password) {
              newItem.password = newItem.password;
            }
          }

          // Mapping for exams
          if (table === 'exams') {
            if (newItem.totalMarks !== undefined) {
              newItem.total_marks = newItem.totalMarks;
              delete (newItem as any).totalMarks;
            }
          }

          // Mapping for assignments
          if (table === 'assignments') {
            if (newItem.dueDate !== undefined) { newItem.due_date = newItem.dueDate; delete (newItem as any).dueDate; }
            if (newItem.totalMarks !== undefined) { newItem.total_marks = newItem.totalMarks; delete (newItem as any).totalMarks; }
            if (newItem.createdAt !== undefined) { newItem.created_at = newItem.createdAt; delete (newItem as any).createdAt; }
          }

          // Mapping for reviews
          if (table === 'reviews') {
            if (newItem.userName !== undefined) { newItem.user_name = newItem.userName; delete (newItem as any).userName; }
            if (newItem.userType !== undefined) { newItem.user_type = newItem.userType; delete (newItem as any).userType; }
            if (newItem.isApproved !== undefined) { newItem.is_approved = newItem.isApproved; delete (newItem as any).isApproved; }
            if (newItem.createdAt !== undefined) { newItem.created_at = newItem.createdAt; delete (newItem as any).createdAt; }
            if (newItem.hscBatch !== undefined) { newItem.hsc_batch = newItem.hscBatch; delete (newItem as any).hscBatch; }
            if (newItem.studentName !== undefined) { newItem.student_name = newItem.studentName; delete (newItem as any).studentName; }
          }

          // Mapping for syllabus_progress
          if (table === 'syllabus_progress') {
            if (newItem.chapterName) { newItem.chapter_name = newItem.chapterName; delete (newItem as any).chapterName; }
            if (newItem.teacherName) { newItem.teacher_name = newItem.teacherName; delete (newItem as any).teacherName; }
            if (newItem.totalLectures !== undefined) { newItem.total_lectures = newItem.totalLectures; delete (newItem as any).totalLectures; }
            if (newItem.updatedAt) { newItem.updated_at = newItem.updatedAt; delete (newItem as any).updatedAt; }
          }

          if (table === 'site_config') {
            if (newItem.adminProfile) { 
              const strVal = typeof newItem.adminProfile === 'object' ? JSON.stringify(newItem.adminProfile) : newItem.adminProfile;
              newItem.admin_profile = strVal;
              delete (newItem as any).adminProfile;
            }
            if (newItem.footerData) { 
              const strVal = typeof newItem.footerData === 'object' ? JSON.stringify(newItem.footerData) : newItem.footerData;
              newItem.footer_data = strVal;
              delete (newItem as any).footerData;
            }
            if (newItem.homeData) { 
              const strVal = typeof newItem.homeData === 'object' ? JSON.stringify(newItem.homeData) : newItem.homeData;
              newItem.home_data = strVal;
              delete (newItem as any).homeData;
            }
          }

          if (table === 'chatbot_knowledge') {
            // No specific mapping needed
          }

          return newItem;
        });

        let error: any = null;
        try {
          const result = await supabase
            .from(table)
            .upsert(mappedPayload, { onConflict: 'id' });
          error = result.error;
        } catch (e: any) {
          console.warn(`[Supabase] Bulk upsert exception for ${table}:`, e.message || e);
          error = e;
        }
          
        if (error) {
          const errorMessage = error.message || (typeof error === 'string' ? error : 'Unknown error');
          console.warn(`[Supabase] Bulk upsert failed for ${table}, attempting atomic updates...`, errorMessage);
          
          let successCount = 0;
          for (const item of mappedPayload) {
            let currentItem = { ...item };
            let atomicRetries = 15; // Increased retries to handle many missing columns
            let synced = false;

            // Add a small delay between items to prevent overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 50));

            while (atomicRetries >= 0 && !synced) {
              try {
                const { error: itemError } = await supabase.from(table).upsert(currentItem, { onConflict: 'id' });
                
                if (itemError) {
                  console.error(`[Supabase] Upsert error for ${table} item:`, itemError.message, currentItem);
                  // Handle "column not found" errors by stripping the offending column
                  if (itemError.message.includes('column') && (itemError.message.includes('not found') || itemError.message.includes('does not exist') || itemError.message.includes('schema cache'))) {
                    // Extract all quoted strings from error message
                    const allMatches = itemError.message.match(/'([^']+)'/g);
                    if (allMatches) {
                      // Find the first match that isn't the table name or 'id'
                      let targetCol = '';
                      for (const m of allMatches) {
                        const clean = m.replace(/'/g, '');
                        // CRITICAL: Never strip id or email as they are essential for identification
                        const isEssential = ['id', 'email'].includes(clean);
                        if (clean !== table && !isEssential && (currentItem as any)[clean] !== undefined) {
                          targetCol = clean;
                          break;
                        }
                      }

                      if (targetCol) {
                        console.warn(`[Supabase] Stripping missing column '${targetCol}' from ${table} and retrying...`);
                        delete (currentItem as any)[targetCol];
                        atomicRetries--;
                        continue; // Retry with stripped item
                      }
                    }
                  }

                  // Handle UUID format errors
                  if (itemError.message.includes('invalid input syntax for type uuid')) {
                    console.warn(`[Supabase] UUID format error for ${table}. Attempting to generate a new UUID...`);
                    currentItem.id = crypto.randomUUID();
                    atomicRetries--;
                    continue;
                  }

                  // Handle timeout or other transient errors with exponential backoff
                  if (itemError.message.toLowerCase().includes('timeout') || 
                      itemError.message.includes('504') || 
                      itemError.message.includes('502') || 
                      itemError.message.toLowerCase().includes('fetch')) {
                    const delay = (15 - atomicRetries) * 1000 + 1000;
                    console.warn(`[Supabase] Network/Transient error for ${table}, retrying in ${delay}ms...`, itemError.message);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    atomicRetries--;
                    continue;
                  }

                  // Special handling for teachers education field (legacy fallback)
                  if (table === 'teachers' && (itemError.message.includes('column') || itemError.message.includes('not found'))) {
                    const { education, ...coreItem } = currentItem as any;
                    currentItem = { ...coreItem, academic_background: education };
                    atomicRetries--;
                    continue;
                  }
                  
                  // If we reach here, it's an unhandled error for this item
                  console.error(`[Supabase] Sync Error for ${table} (ID: ${item.id}):`, itemError.message);
                  console.error(`[Supabase] Problematic Payload:`, JSON.stringify(currentItem));
                  break;
                } else {
                  successCount++;
                  synced = true;
                }
              } catch (e: any) {
                const isNetworkError = e.message?.toLowerCase().includes('fetch') || 
                                     e.message?.toLowerCase().includes('network') ||
                                     e.message?.toLowerCase().includes('timeout');
                
                if (isNetworkError && atomicRetries > 0) {
                  const delay = (15 - atomicRetries) * 1000 + 1000;
                  console.warn(`[Supabase] Atomic sync network exception for ${table}, retrying in ${delay}ms...`, e.message);
                  await new Promise(resolve => setTimeout(resolve, delay));
                  atomicRetries--;
                  continue;
                }
                
                console.error(`[Supabase] Atomic sync crash for ${table}:`, e);
                break;
              }
            }
          }
          console.log(`[Supabase] Atomic sync completed for ${table}: ${successCount}/${payload.length} items saved.`);
          if (successCount < payload.length) {
            throw new Error(`[Supabase] Sync failed for ${table}. Only ${successCount}/${payload.length} items synced.`);
          }
          return;
        }
        console.log(`[Supabase] Successfully synced ${table}`);
      } catch (err: any) {
        if (currentRetry > 0) {
          const nextDelay = delay * Math.pow(2, 3 - currentRetry);
          console.warn(`[Supabase] Sync failed for ${table}, retrying in ${nextDelay}ms... (${currentRetry} retries left)`, err.message || err);
          await new Promise(resolve => setTimeout(resolve, nextDelay));
          return attemptSync(currentRetry - 1);
        }
        throw err;
      }
    };

    await attemptSync(retries);
  } catch (err: any) {
    console.error(`[Supabase] Critical failure syncing ${table}:`, err.message || err);
    throw err;
  }
};

/**
 * Deletes data from Supabase.
 */
export const deleteData = async (table: string, id: string) => {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
    return { success: true };
  } catch (err) {
    console.error(`Supabase deletion failed for ${table}:`, err);
    throw err;
  }
};

/**
 * Fetches initial application state.
 */
export const safeParse = (data: any) => {
  if (typeof data === 'string') {
    try {
      let parsed = JSON.parse(data);
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      return parsed || {};
    } catch (e) {
      return {};
    }
  }
  return data || {};
};

export const fetchAllData = async () => {
  try {
    const results = await Promise.allSettled([
      supabase.from('students').select('*'),
      supabase.from('subjects').select('*'),
      supabase.from('teachers').select('*'),
      supabase.from('exams').select('*'),
      supabase.from('video_classes').select('*'),
      supabase.from('site_config').select('*').order('id', { ascending: true }).limit(1),
      supabase.from('chatbot_knowledge').select('*'),
      supabase.from('assignments').select('*'),
      supabase.from('reviews').select('*'),
      supabase.from('notices').select('*'),
      supabase.from('syllabus_progress').select('*')
    ]);

    const getRes = (idx: number) => {
      const res = results[idx];
      return res.status === 'fulfilled' ? res.value : { data: [], error: { message: 'Promise rejected' } };
    };

    const studentsRes = getRes(0);
    const subjectsRes = getRes(1);
    const teachersRes = getRes(2);
    const examsRes = getRes(3);
    const videoClassesRes = getRes(4);
    const configRes = getRes(5);
    const chatbotRes = getRes(6);
    const assignmentsRes = getRes(7);
    const reviewsRes = getRes(8);
    const noticesRes = getRes(9);
    const syllabusRes = getRes(10);

    // Log any errors for debugging
    if (studentsRes.error) console.warn('Error fetching students:', studentsRes.error.message);
    if (studentsRes.data && studentsRes.data.length > 0) {
      console.log('[Supabase] Available columns in students table:', Object.keys(studentsRes.data[0]));
    }
    if (subjectsRes.error) console.warn('Error fetching subjects:', subjectsRes.error.message);
    if (teachersRes.error) console.warn('Error fetching teachers:', teachersRes.error.message);
    if (examsRes.error) console.warn('Error fetching exams:', examsRes.error.message);
    if (assignmentsRes.error) console.warn('Error fetching assignments:', assignmentsRes.error.message);
    if (reviewsRes.error) console.warn('Error fetching reviews:', reviewsRes.error.message);
    if (videoClassesRes.error) console.warn('Error fetching video_classes:', videoClassesRes.error.message);
    if (chatbotRes.error) console.warn('Error fetching chatbot_knowledge:', chatbotRes.error.message);
    if (noticesRes.error) console.warn('Error fetching notices:', noticesRes.error.message);

    const result = {
      students: (studentsRes.data || []).map((s: any) => {
        // Log column presence for attendance monitoring
        if (!s.daily_attendance && !s.dailyAttendance) {
          // Only log once to avoid noise
          if (Math.random() < 0.01) console.warn('[Supabase] Missing attendance column detected in students fetch');
        }
        
        return {
          ...s,
          sscRoll: s.ssc_roll || s.sscRoll || '',
          sscReg: s.ssc_reg || s.sscReg || '',
          ownPhone: s.own_phone || s.ownPhone || '',
          guardianPhone: s.guardian_phone || s.guardianPhone || '',
          monthlyFeeStatus: s.monthly_fee_status || s.monthlyFeeStatus || 'Due',
          courseFeeStatus: s.course_fee_status || s.courseFeeStatus || 'Due',
          subjectPayments: s.subject_payments || s.subjectPayments || {},
          subjectPaymentTypes: s.subject_payment_types || s.subjectPaymentTypes || {},
          subjectEnrollmentDates: s.subject_enrollment_dates || s.subjectEnrollmentDates || {},
          monthlyPayments: s.monthly_payments || s.monthlyPayments || {},
          averageScore: s.average_score || s.averageScore || 0,
          isVerified: s.is_verified ?? s.isVerified ?? false,
          dailyAttendance: safeParse(s.daily_attendance || s.dailyAttendance || '{}'),
          attendance: s.attendance || 0,
          joinDate: s.join_date || s.joinDate || s.created_at?.split('T')[0] || '',
          feeRecords: Array.isArray(s.fee_records) ? s.fee_records : (Array.isArray(s.payment_records) ? s.payment_records : (Array.isArray(s.feeRecords) ? s.feeRecords : [])),
          assignmentSubmissions: s.assignment_submissions || s.assignmentSubmissions || [],
          batch: s.batch || '',
          subjects: Array.isArray(s.subjects) ? s.subjects : [],
          password: s.password || ''
        };
      }),
      subjects: (subjectsRes.data || []).map((s: any) => ({
        ...s,
        classesPerWeek: s.classes_per_week || s.classesPerWeek || 3,
        paymentType: s.payment_type || s.paymentType || 'Monthly',
        assignedTeachers: s.assigned_teachers || s.assignedTeachers || [],
        subSubjects: s.sub_subjects || s.subSubjects || [],
        description: s.description || '',
        thumbnail: s.thumbnail || ''
      })),
      teachers: (teachersRes.data || []).map((t: any) => {
        const mappedTeacher = {
          ...t,
          name: t.name || '',
          subject: t.subject || '',
          qualification: t.qualification || '',
          experience: t.experience || '',
          image: t.image || '',
          education: t.education || t.academic_background || t.educational_background || '',
          email: t.email || '',
          password: t.password || '',
          profileType: t.profile_type || t.profileType || 'text',
          profileContent: t.profile_content || t.profileContent || ''
        };
        return mappedTeacher;
      }),
      exams: (examsRes.data || []).map((e: any) => ({
        ...e,
        totalMarks: e.total_marks || e.totalMarks || 100,
        marks: e.marks || {},
        batch: e.batch || 'All'
      })),
      videoClasses: (videoClassesRes.data || []).map((v: any) => {
        const youtubeUrl = v.youtube_url || v.youtubeUrl || '';
        let thumbnail = v.thumbnail;
        if (!thumbnail && youtubeUrl) {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
          const match = youtubeUrl.match(regExp);
          if (match && match[2].length === 11) {
            thumbnail = `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
          }
        }
        return {
          ...v,
          youtubeUrl,
          thumbnail
        };
      }),
      chatbotKnowledge: chatbotRes.data || [],
      assignments: (assignmentsRes.data || []).map((a: any) => ({
        ...a,
        dueDate: a.due_date || a.dueDate || '',
        totalMarks: a.total_marks || a.totalMarks || 100,
        createdAt: a.created_at || a.createdAt || ''
      })),
      notices: (noticesRes.data || []).map((n: any) => ({
        ...n,
        facultyId: n.faculty_id || n.facultyId || '',
        createdAt: n.created_at || n.createdAt || ''
      })),
      reviews: (reviewsRes.data || []).map((r: any) => ({
        ...r,
        userName: r.user_name || r.userName || '',
        userType: r.user_type || r.userType || 'Other',
        isApproved: r.is_approved || r.isApproved || false,
        createdAt: r.created_at || r.createdAt || '',
        hscBatch: r.hsc_batch || r.hscBatch || undefined,
        studentName: r.student_name || r.studentName || undefined,
        relation: r.relation || undefined
      })),
      syllabusProgress: (syllabusRes.data || []).map((s: any) => ({
        ...s,
        chapterName: s.chapter_name || s.chapterName || '',
        teacherName: s.teacher_name || s.teacherName || '',
        totalLectures: s.total_lectures || s.totalLectures || 1,
        updatedAt: s.updated_at || s.updatedAt || ''
      })),
      config: (configRes.data && configRes.data.length > 0) ? {
        ...configRes.data[0],
        adminProfile: safeParse(configRes.data[0].admin_profile || configRes.data[0].adminProfile),
        footerData: safeParse(configRes.data[0].footer_data || configRes.data[0].footerData),
        homeData: safeParse(configRes.data[0].home_data || configRes.data[0].homeData)
      } : null
    };

    console.log("[Supabase] Data Fetch Summary:", {
      students: result.students.length,
      teachers: result.teachers.length,
      subjects: result.subjects.length,
      exams: result.exams.length,
      videoClasses: result.videoClasses.length,
      chatbotKnowledge: result.chatbotKnowledge.length,
      hasConfig: !!result.config
    });

    return result;
  } catch (err) {
    console.error('Initial fetch failed completely:', err);
    return null;
  }
};
