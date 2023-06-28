class CreateHalfTokens < ActiveRecord::Migration[7.0]
  def change
    create_table :half_tokens do |t|
      t.belongs_to :user, null: false, foreign_key: true
      t.string :token, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
