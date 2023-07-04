class CreateBookmarks < ActiveRecord::Migration[7.0]
  def change
    create_table :bookmarks do |t|
      t.belongs_to :user, null: false, foreign_key: true
      t.belongs_to :opportunity, null: false, foreign_key: true

      t.timestamps
    end
    add_index :bookmarks, [:user_id, :opportunity_id], unique: true
  end
end
