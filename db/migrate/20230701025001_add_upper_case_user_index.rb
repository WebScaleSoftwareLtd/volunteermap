class AddUpperCaseUserIndex < ActiveRecord::Migration[7.0]
  def change
    add_index :users, "UPPER(username)", unique: true
  end
end
