import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import logo from "../../../assets/logo.png";

const navItems = ["Learn", "Build", "Explore"];

const Navbar = () => {
  const navigate = useNavigate();
  
  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem("syncide_user") !== null;
  };

  const handleLaunch = () => {
    if (isLoggedIn()) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleAccountClick = () => {
    if (isLoggedIn()) {
      navigate("/account");
    } else {
      navigate("/auth");
    }
  };
  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50"
    >
      <div className="relative bg-neutral-950/70 backdrop-blur-xl border-b border-white/5 overflow-hidden">

        {/* FUTURISTIC AMBIENT LAYERS */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/3 top-0 h-24 w-80 bg-emerald-400/10 blur-3xl animate-pulse" />
          <div className="absolute right-1/4 top-0 h-24 w-80 bg-cyan-400/10 blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3 cursor-pointer select-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <img src={logo} alt="SyncIDE Logo" className="h-9 w-9" />
              <span className="absolute inset-0 rounded-full ring-1 ring-emerald-400/30" />
            </motion.div>

            <span className="text-lg font-semibold tracking-wide text-white">
              Sync<span className="text-emerald-400">IDE</span>
            </span>
          </div>

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center gap-14">
            {navItems.map((item) => (
              <motion.div
                key={item}
                whileHover="hover"
                initial="rest"
                animate="rest"
                className="relative cursor-pointer"
              >
                <motion.span
                  variants={{
                    rest: { opacity: 0.7 },
                    hover: { opacity: 1, scale: 1.08 },
                  }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="text-sm tracking-wide text-gray-300"
                >
                  {item}
                </motion.span>

                {/* ENERGY UNDERLINE */}
                <motion.span
                  variants={{
                    rest: { width: 0, opacity: 0 },
                    hover: { width: "100%", opacity: 1 },
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="
                    absolute -bottom-2 left-0 h-[2px]
                    bg-gradient-to-r from-emerald-400 to-cyan-400
                    rounded-full
                  "
                />
              </motion.div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-6">

            {/* DOCS */}
            <motion.div
              whileHover="hover"
              initial="rest"
              animate="rest"
              className="hidden sm:block relative cursor-pointer"
            >
              <motion.button
                variants={{
                  rest: { opacity: 0.7 },
                  hover: { opacity: 1, scale: 1.08 },
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
              >
                Docs
              </motion.button>
              {/* ENERGY UNDERLINE */}
              <motion.span
                variants={{
                  rest: { width: 0, opacity: 0 },
                  hover: { width: "100%", opacity: 1 },
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="
                  absolute -bottom-2 left-0 h-[2px]
                  bg-gradient-to-r from-emerald-400 to-cyan-400
                  rounded-full
                "
              />
            </motion.div>

            {/* ACCOUNT */}
            <motion.div
              onClick={handleAccountClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <VscAccount className="w-5 h-5 text-gray-400 hover:text-emerald-400 transition-colors" />
            </motion.div>

            {/* LAUNCH */}
            <motion.button
              onClick={handleLaunch}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="
                relative px-5 py-2 rounded-xl text-sm font-medium text-black
                bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400
                bg-[length:200%_200%]
                animate-gradient-x
                shadow-lg shadow-emerald-400/30
                overflow-hidden
              "
            >
              <span className="relative z-10">{isLoggedIn() ? "Dashboard" : "Launch"}</span>

              {/* INNER GLOW */}
              <span className="absolute inset-0 bg-white/20 blur-xl opacity-20" />
            </motion.button>

          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
