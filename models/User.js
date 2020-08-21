import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// User schema
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required!"],
      match: [/^.{4,100}$/, "Should be 4-12 characters!"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required!"],
      match: [/^.{1,50}$/, "Should be 1-12 characters!"],
      trim: true,
    },
    search_record_onoff: {
      type: Boolean,
      default: true,
    },
  },
  {
    // toObject 함수를 사용하면 plain javascript object 로 변경할 수 있다
    // virtuals: true 는 virtual 로 설정된 항목들을 toObject 함수에서 표시하게 하는
    // 설정으로 기본적으로 virtual 들은 console.log 에서 표시 되지 않는다
    toObject: { virtuals: true },
  }
);

// User Schema Virtuals
// virtual 을 사용하는 이유?
// DB 에 저장하고 싶은 데이터는 아니지만, user 모델에서 사용하고 싶기 때문
userSchema
  .virtual("passwordConfirmation")
  .get(function () {
    return this._passwordConfirmation;
  })
  .set(function (value) {
    this._passwordConfirmation = value;
  });

userSchema
  .virtual("originalPassword")
  .get(function () {
    return this._originalPassword;
  })
  .set(function (value) {
    this._originalPassword = value;
  });

userSchema
  .virtual("currentPassword")
  .get(function () {
    return this._currentPassword;
  })
  .set(function (value) {
    this._currentPassword = value;
  });

userSchema
  .virtual("newPassword")
  .get(function () {
    return this._newPassword;
  })
  .set(function (value) {
    this._newPassword = value;
  });

// password validation
// password를 DB에 생성, 수정하기 전에 값이 유효(valid)한지 확인(validate)을 하는 코드
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
const passwordRegexErrorMessage =
  "Should be minimum 8 chracters of alphabet and number combination!";
userSchema.path("password").validate(function (v) {
  const user = this;

  // create user
  if (user.isNew) {
    if (!user.passwordConfirmation) {
      user.invalidate(
        "passwordConfirmation",
        "Password Confirmation is required."
      );
    }

    if (!passwordRegex.test(user.password)) {
      user.invalidate("password", passwordRegexErrorMessage);
    }
    if (user.password !== user.passwordConfirmation) {
      user.invalidate(
        "passwordConfirmation",
        "Password Confirmation does not matched!"
      );
    }
  }

  // update user
  if (!user.isNew) {
    if (!user.currentPassword) {
      user.invalidate("currentPassword", "Current Password is required!");
    }
    // compareSync(실제값, hash로 변환된 값)
    else if (!bcrypt.compareSync(user.currentPassword, user.originalPassword)) {
      user.invalidate("currentPassword", "Current Password is invalid!");
    }

    if (user.newPassword && !passwordRegex.test(user.newPassword)) {
      user.invalidate("newPassword", passwordRegexErrorMessage);
    } else if (user.newPassword !== user.passwordConfirmation) {
      user.invalidate(
        "passwordConfirmation",
        "Password Confirmation does not matched!"
      );
    }
  }
});

// hash password
userSchema.pre("save", function (next) {
  const user = this;

  // db 에 기록된 값과 비교해서 변경된 경우 true 그렇지 않으면 false
  // user 생성시는 항상 true 이며, 수정시는 password 가 변경된 경우에만 true
  if (user.isModified("password")) {
    // user 를 생성하거나 수정시 user.password 의 변경이 있는 경우에는
    // bcrypt.hashSync 함수로 password 를 hash 값으로 바꿉니다
    user.password = bcrypt.hashSync(user.password);
    return next();
  } else {
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  const user = this;
  return bcrypt.compareSync(password, user.password);
};

// model & export
// mongoose.model("user", userSchema) 이부분은 데이터베이스에
// userSchema 라는 형태를 가진 스키마를 "user" 라는 이름의 콜렉션으로 데이터베이스에 생성한다
const User = mongoose.model("user", userSchema);

export default User;
