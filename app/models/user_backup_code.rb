class UserBackupCode < ApplicationRecord
    belongs_to :user
    validates :backup_code, presence: true
end
