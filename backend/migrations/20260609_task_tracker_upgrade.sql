-- Run once before starting the upgraded backend if your database already has the old tasks table.
-- MySQL compatible. For PostgreSQL, replace MODIFY COLUMN with ALTER COLUMN TYPE VARCHAR(...).

ALTER TABLE tasks
  ADD COLUMN parent_task_id INT NULL,
  ADD COLUMN source_type VARCHAR(50) NULL,
  ADD COLUMN source_id INT NULL,
  ADD COLUMN progress INT DEFAULT 0,
  ADD COLUMN estimated_effort VARCHAR(100) NULL,
  ADD COLUMN recurrence VARCHAR(40) DEFAULT 'none',
  ADD COLUMN recurrence_anchor VARCHAR(20) NULL;

ALTER TABLE tasks MODIFY COLUMN priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE tasks MODIFY COLUMN status VARCHAR(40) DEFAULT 'pending';
UPDATE tasks SET status='completed' WHERE status='done';

CREATE TABLE IF NOT EXISTS task_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  author_name VARCHAR(200) NULL,
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  content_type VARCHAR(120) NULL,
  size_bytes INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_attachments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_attachments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
