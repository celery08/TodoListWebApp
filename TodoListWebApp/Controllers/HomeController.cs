using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TodoListWebApp.Models;

namespace TodoListWebApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            var username = HttpContext.Session.GetString("UserName");
            if (string.IsNullOrEmpty(username))
            {
                return RedirectToAction("Login", "Account");
            }

            ViewBag.UserName = username;
            return View();
        }
    }
}
