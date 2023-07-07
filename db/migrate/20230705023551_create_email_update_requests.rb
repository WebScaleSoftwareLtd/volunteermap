class CreateEmailUpdateRequests < ActiveRecord::Migration[7.0]
  def change
    create_table :email_update_requests do |t|
      t.string :email, null: false, index: { unique: true }
      t.belongs_to :user, null: false, foreign_key: true, index: { unique: true }
      t.string :token, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
