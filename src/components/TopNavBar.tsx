import { Link, useNavigate } from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { Button } from "./ui/button";

import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Logo from "../assets/Logo.jpeg";
import { Menu } from "lucide-react";

const navItems = [
  { label: "Home", to: "/" },
  { label: "How it works", to: "/#how-it-works" },
  { label: "About", to: "/about" },
  { label: "Our services", to: "/OurImpact" },
  { label: "Featured Product", to: "/programs" },
  { label: "Contact", to: "/gallery" },
];

export const TopNavBar = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full h-[70px] sm:h-[80px] bg-background">
      {/* Mobile nav */}
      <div className="flex md:hidden items-center justify-between px-4 sm:px-6 h-full">
        <div className="flex items-center gap-2">
          <img
            src={Logo}
            alt="Mofresh_logo"
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain block shrink-0"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <Menu size={26} />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-64 sm:w-72">
            <nav className="flex flex-col gap-4 sm:gap-6 mt-8 sm:mt-10">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="font-heading text-base sm:text-lg text-center hover:bg-amber-200 rounded-md py-2"
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex flex-col gap-2 mt-4 sm:mt-6 mx-4 sm:mx-5">
                <Button
                  onClick={() => navigate("/register")}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
                >
                  SignUp
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
                >
                  Login
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex justify-center h-full">
        <NavigationMenu className="flex items-center gap-8 lg:gap-12 xl:gap-20 h-full px-4 lg:px-8">
          <img
            src={Logo}
            alt="Mofresh_logo"
            className="h-12 w-16 md:h-14 md:w-20 lg:h-16 lg:w-24 object-contain"
          />

          <NavigationMenuList className="flex items-center gap-6 lg:gap-8 xl:gap-10">
            {navItems.map((item) => (
              <NavigationMenuItem
                key={item.label}
                className="font-heading cursor-pointer hover:font-bold text-sm lg:text-base"
              >
                <Link to={item.to}>{item.label}</Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
          <div className="flex gap-2 ml-4 lg:ml-8 xl:ml-10">
            <Button
              onClick={() => navigate("/register")}
              className="bg-green-600 hover:bg-green-700 text-white text-sm lg:text-base px-3 lg:px-4 py-2"
            >
              <div className="flex items-center gap-2">SignUp</div>
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-green-600 hover:bg-green-700 text-white text-sm lg:text-base px-3 lg:px-4 py-2"
            >
              <div className="flex items-center gap-2">Login</div>
            </Button>
          </div>
        </NavigationMenu>
      </div>
    </header>
  );
};