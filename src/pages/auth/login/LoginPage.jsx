import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoReloadCircleSharp } from "react-icons/io5";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import SideStyle from "../AuthSideStyle/index.jsx"; // Ensure this path is correct
import { useAuth } from "../../../middlewares/auth";
import { usePost } from "../../../hooks/useApi.jsx";

const schema = yup.object().shape({
  emailOrPhone: yup.string().required("Email or Phone number is required"),
  password: yup.string().required("Password is required"),
  additionalInfo: yup.string().when("toggle", {
    is: true,
    then: yup.string().required("Workplace ID is required"),
  }),
});

function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);
  const handleLoginMutate = usePost(toggle ? "/employee/login" : "/user/login");
  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleDialogClose = () => setOpenDialog(false);
  const handleDialogOpen = () => setOpenDialog(true);

  const handleLogin = async (data) => {
    try {
      const dataSubmit = {
        emailOrPhone: data.emailOrPhone,
        password: data.password,
        ...(toggle && { loginId: data.additionalInfo }), // Corrected field name
      };
      setLoading(true);
      const res = await handleLoginMutate.mutateAsync({ dataSubmit });

      if (res.data) {
        login(res.data.message?.data, res.data.message?.token);
        setTimeout(() => {
          toast.success("Login successful");
          navigate("/");
          setLoading(false);
        }, 2000);
      } else {
        toast.error(res.error?.error || "Login failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Side - SideStyle */}
      <div className="w-full sm:w-1/3">
        <SideStyle text="Login Now ..." />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full sm:w-2/3 flex items-center justify-center bg-gradient-to-br from-gray-100 to-purple-200 p-4 sm:p-6">
        <ToastContainer />
        <div className="bg-white/90 rounded-2xl p-8 shadow-2xl w-full max-w-xl">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Sign In</h1>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <Controller
                name="emailOrPhone"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="text"
                      placeholder="Email or Phone"
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.emailOrPhone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.emailOrPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.emailOrPhone.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            <div>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleClickShowPassword}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                    </button>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            {toggle && (
              <div>
                <Controller
                  name="additionalInfo"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <input
                        {...field}
                        type="text"
                        placeholder="Workplace ID"
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.additionalInfo ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.additionalInfo && (
                        <p className="text-red-500 text-sm mt-1">{errors.additionalInfo.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={toggle}
                onChange={() => setToggle(!toggle)}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-gray-700">Login to Workplace</label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg hover:from-blue-700 hover:to-blue-500 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <IoReloadCircleSharp className="animate-spin text-2xl" />
              ) : (
                "Sign In"
              )}
            </button>
            <div className="text-center text-sm">
              <p>
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Register
                </Link>
              </p>
              <p
                className="text-blue-600 cursor-pointer hover:underline mt-2"
                onClick={handleDialogOpen}
              >
                Download Software
              </p>
            </div>
          </form>

          {/* Dialog */}
          <div
            className={`fixed inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
              openDialog ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-center mb-4">Download Software</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">For Windows</p>
                  <a
                    href="https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/win32/x64/Multiverse-1.0.5+Setup.exe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-2 border rounded-lg text-center text-blue-600 hover:bg-blue-50"
                  >
                    Download
                  </a>
                </div>
                <div>
                  <p className="font-semibold">For Mac (Intel)</p>
                  <a
                    href="https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/darwin/x64/Multiverse-1.0.5-x64.dmg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-2 border rounded-lg text-center text-blue-600 hover:bg-blue-50"
                  >
                    Download
                  </a>
                </div>
                <div>
                  <p className="font-semibold">For Mac (Silicon)</p>
                  <a
                    href="https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/darwin/arm64/Multiverse-1.0.5-arm64.dmg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-2 border rounded-lg text-center text-blue-600 hover:bg-blue-50"
                  >
                    Download
                  </a>
                </div>
              </div>
              <button
                onClick={handleDialogClose}
                className="w-full p-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;