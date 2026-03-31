namespace PlatformAPI.Helpers
{
    public static class CookieHelper
    {
        public static void SetCookie(HttpResponse response, string key, string value, int days = 365)
        {
            response.Cookies.Append(key, value, new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddDays(days),
                IsEssential = true,
                SameSite = SameSiteMode.Lax,
                Secure = true
            });
        }

        //public static void SetOrReplaceCookie(HttpRequest request, HttpResponse response, string key, string value, int days = 365)
        //{
        //    // Check if the cookie exists
        //    if (request.Cookies.ContainsKey(key))
        //    {
        //        // Remove or expire the existing cookie
        //        response.Cookies.Delete(key);
        //    }

        //    // Add the new cookie
        //    response.Cookies.Append(key, value, new CookieOptions
        //    {
        //        Expires = DateTimeOffset.UtcNow.AddDays(days),
        //        IsEssential = true,
        //        SameSite = SameSiteMode.None,
        //        Secure = true
        //    });
        //}
        public static void SetOrReplaceCookie(HttpRequest request, HttpResponse response, 
            string key, string value, int days = 365, bool isProduction = false)
        {
            if (request.Cookies.ContainsKey(key))
            {
                response.Cookies.Delete(key);
            }

            var options = new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddDays(days),
                IsEssential = true,
                SameSite = SameSiteMode.None,
                Secure = true,
                Path = "/"
            };

            if (isProduction)
            {
                options.Domain = ".mquizbymichelle.com";
            }

            response.Cookies.Append(key, value, options);
        }


    }
}

