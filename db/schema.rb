# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2023_07_02_141238) do
  create_table "domain_associations", force: :cascade do |t|
    t.integer "user_id", null: false
    t.boolean "validation_active", default: true, null: false
    t.string "domain", null: false
    t.integer "validation_check_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["domain"], name: "index_domain_associations_on_domain"
    t.index ["user_id"], name: "index_domain_associations_on_user_id"
  end

  create_table "half_tokens", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_half_tokens_on_token", unique: true
    t.index ["user_id"], name: "index_half_tokens_on_user_id"
  end

  create_table "opportunities", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "domain_association_id"
    t.boolean "mentally_taxing", null: false
    t.boolean "physically_taxing", null: false
    t.boolean "time_flexible", null: false
    t.string "category", null: false
    t.string "title", null: false
    t.string "description", null: false
    t.string "email"
    t.string "phone"
    t.string "website"
    t.decimal "latitude", precision: 10, scale: 6, null: false
    t.decimal "longitude", precision: 10, scale: 6, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "uuid", null: false
    t.index ["domain_association_id"], name: "index_opportunities_on_domain_association_id"
    t.index ["user_id"], name: "index_opportunities_on_user_id"
    t.index ["uuid"], name: "index_opportunities_on_uuid", unique: true
  end

  create_table "pending_signups", force: :cascade do |t|
    t.string "email", null: false
    t.string "email_token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "redirect_to"
    t.index ["email"], name: "index_pending_signups_on_email"
    t.index ["email_token"], name: "index_pending_signups_on_email_token", unique: true
  end

  create_table "user_backup_codes", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "backup_code", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["backup_code"], name: "index_user_backup_codes_on_backup_code"
    t.index ["user_id"], name: "index_user_backup_codes_on_user_id"
  end

  create_table "user_tokens", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_user_tokens_on_token", unique: true
    t.index ["user_id"], name: "index_user_tokens_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.string "email"
    t.string "user_validation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "password_digest", null: false
    t.string "2fa_token"
    t.index "UPPER(username)", name: "index_users_on_UPPER_username", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["user_validation_id"], name: "index_users_on_user_validation_id", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "domain_associations", "users"
  add_foreign_key "half_tokens", "users"
  add_foreign_key "opportunities", "users"
  add_foreign_key "user_backup_codes", "users"
  add_foreign_key "user_tokens", "users"
end
