class CreateUserBackupCodes < ActiveRecord::Migration[7.0]
  def change
    create_table :user_backup_codes do |t|
      t.belongs_to :user, null: false, foreign_key: true
      t.string :backup_code, null: false, index: true

      t.timestamps
    end
  end
end
