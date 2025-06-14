-- Users Table: Stores login credentials and roles
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('member', 'staff', 'trainer', 'owner', 'guest')), -- Added 'guest' for consistency
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table: Stores personal details of users
CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    phone_number VARCHAR(20),
    address TEXT,
    occupation VARCHAR(100),
    profile_picture_url VARCHAR(255),
    fingerprint_data TEXT, -- Consider security and privacy implications
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Password Reset Tokens Table
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table: Information about gym rooms
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- e.g., 'gym', 'yoga', 'fitness', 'group_x'
    capacity INTEGER,
    status VARCHAR(50) DEFAULT 'active', -- e.g., 'active', 'maintenance', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Table: Information about gym equipment
CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(100) NOT NULL,
    room_id INTEGER REFERENCES rooms(room_id) ON DELETE SET NULL, -- Equipment can be in a room
    quantity INTEGER DEFAULT 1,
    date_acquired DATE,
    warranty_expires_on DATE,
    origin VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'operational', -- e.g., 'operational', 'maintenance', 'out_of_order'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Maintenance Table
CREATE TABLE equipment_maintenance (
    maintenance_id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
    reported_by_user_id INTEGER REFERENCES users(user_id), -- Staff who reported
    description TEXT NOT NULL,
    date_reported TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_resolved TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- e.g., 'pending', 'in_progress', 'resolved', 'cannot_fix'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Membership Packages Table
CREATE TABLE membership_packages (
    package_id SERIAL PRIMARY KEY,
    package_name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_days INTEGER, -- e.g., 30 for monthly, 90 for 3 months, 365 for yearly. Null for per-session.
    price NUMERIC(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'time_based', 'session_based', 'vip', 'personal_training'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Member Subscriptions Table: Tracks member's active packages
CREATE TABLE member_subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    member_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    package_id INTEGER NOT NULL REFERENCES membership_packages(package_id),
    start_date DATE NOT NULL,
    end_date DATE, -- Can be null for session-based packages or if auto-renewing
    sessions_total INTEGER, -- For session-based packages
    sessions_remaining INTEGER, -- For session-based packages
    payment_status VARCHAR(50) DEFAULT 'pending', -- e.g., 'pending', 'paid', 'failed', 'refunded'
    payment_method VARCHAR(50), -- e.g., 'cash', 'card', 'online_wallet'
    transaction_id VARCHAR(255), -- For payment gateway reference
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workout Sessions / Attendance Table: Records member's gym usage
CREATE TABLE workout_sessions (
    session_id SERIAL PRIMARY KEY,
    member_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES member_subscriptions(subscription_id) ON DELETE SET NULL, -- Link to the specific subscription used
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE,
    activity_type VARCHAR(100), -- e.g., 'general_gym', 'yoga_class', 'personal_training', (Loại buổi tập)
    notes TEXT, -- General notes about the session
    recorded_by_user_id INTEGER REFERENCES users(user_id), -- Staff or trainer who recorded, if applicable (Huấn luyện viên)
    session_name VARCHAR(255) NULL, -- (Tên buổi tập)
    completion_percentage INTEGER NULL CHECK (completion_percentage >= 0 AND completion_percentage <= 100), -- (Mức độ tham gia - percentage)
    trainer_notes_on_completion TEXT NULL -- (Mức độ tham gia - Huấn luyện viên nhận xét)
);

-- Personal Training Bookings Table
CREATE TABLE personal_training_bookings (
    booking_id SERIAL PRIMARY KEY,
    member_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    trainer_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES member_subscriptions(subscription_id), -- If part of a PT package
    session_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'scheduled', -- e.g., 'scheduled', 'completed', 'cancelled_member', 'cancelled_trainer', 'no_show'
    notes_member TEXT,
    notes_trainer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trainer Specializations (Optional, if trainers have specific skills)
CREATE TABLE trainer_specializations (
    trainer_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    specialization VARCHAR(100) NOT NULL,
    PRIMARY KEY (trainer_user_id, specialization)
);

-- Staff Schedules Table (For staff and trainers)
CREATE TABLE staff_schedules (
    schedule_id SERIAL PRIMARY KEY,
    staff_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    activity_description VARCHAR(255), -- e.g., 'Front Desk Duty', 'Group Class Instruction', 'Floor Supervision'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Table: Member feedback on services, staff, facilities
CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    member_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL, -- e.g., 'service_quality', 'staff_performance', 'facility_condition', 'general'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Optional star rating
    comments TEXT NOT NULL,
    related_staff_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL, -- If feedback is about a specific staff/trainer
    related_equipment_id INTEGER REFERENCES equipment(equipment_id) ON DELETE SET NULL, -- If feedback is about specific equipment
    status VARCHAR(50) DEFAULT 'submitted', -- e.g., 'submitted', 'acknowledged', 'in_progress', 'resolved', 'closed'
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table (Optional, for system-generated notifications)
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50), -- e.g., 'reminder', 'promotion', 'alert'
    link_url VARCHAR(255), -- Link to relevant page in app
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_member_subscriptions_member_id ON member_subscriptions(member_user_id);
CREATE INDEX idx_member_subscriptions_package_id ON member_subscriptions(package_id);
CREATE INDEX idx_workout_sessions_member_id ON workout_sessions(member_user_id);
CREATE INDEX idx_personal_training_bookings_member_id ON personal_training_bookings(member_user_id);
CREATE INDEX idx_personal_training_bookings_trainer_id ON personal_training_bookings(trainer_user_id);
CREATE INDEX idx_feedback_member_id ON feedback(member_user_id);
CREATE INDEX idx_equipment_maintenance_equipment_id ON equipment_maintenance(equipment_id);
CREATE INDEX idx_staff_schedules_staff_id ON staff_schedules(staff_user_id);

-- You might want to add more specific indexes based on common query patterns.

-- Trigger function to update 'updated_at' columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with 'updated_at'
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_maintenance_updated_at BEFORE UPDATE ON equipment_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_membership_packages_updated_at BEFORE UPDATE ON membership_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_subscriptions_updated_at BEFORE UPDATE ON member_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personal_training_bookings_updated_at BEFORE UPDATE ON personal_training_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON staff_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- End of schema
