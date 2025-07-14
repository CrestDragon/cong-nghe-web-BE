import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            match: [
                /^[a-zA-Z]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/,
                "Username must be contain at least 5 characters"
            ],
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            match: [
                /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
                "Please provide a valid email address"
            ],
            validate: {
                validator: function (v) {
                    return this.model("User")
                        .findOne({ email: v })
                        .then((user) => !user);
                },
                message: (props) => `${props.value} is already used by another user`
            }
        },
        phone: {
            type: String,
            required: true,
            match: [
                /(84|0[3|5|7|8|9])([0-9]{8})\b/,
                "Phone is invalid! Please try again."
            ],
        },
        address: {
            type: String,
            required: true,
        },
        registration: {
            type: String,
            default: Date.now()
        },
        img: {
            type: String,
        },
        password: {
            type: String,
            required: true,
            // match: [
            //     /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,20}$/,
            //         "Password must between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter."
            //     ],
        },
        confirmPassword:{
            type:String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {timestamps: true}
);

export default mongoose.model("User", UserSchema);