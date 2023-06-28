class CreatePendingSignups < ActiveRecord::Migration[7.0]
  def change
    create_table :pending_signups do |t|
      t.string :email, null: false, index: true
      t.string :email_token, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
