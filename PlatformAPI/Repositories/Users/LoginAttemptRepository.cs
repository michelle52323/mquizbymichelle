using System;
using System.Collections.Generic;
using System.Linq;
using PlatformAPI.Data; // Replace with your actual DbContext namespace
using PlatformAPI.Models; // Replace with your LoginAttempt model namespace
using PlatformAPI.Repositories.Interfaces;
using PlatformAPI.Models.Users;
using Microsoft.EntityFrameworkCore;

namespace PlatformAPI.Repositories
{
    public class LoginAttemptRepository : ILoginAttemptRepository
    {
        private readonly AppDbContext _context;

        public LoginAttemptRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LoginAttempt>> GetAttemptsByUsernameAsync(string username, DateTime since)
        {
            return await _context.LoginAttempts
                                 .Where(a => a.UserName == username && a.Timestamp >= since)
                                 .OrderByDescending(a => a.Timestamp)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<LoginAttempt>> GetAttemptsByIpAsync(string ipAddress, DateTime since)
        {
            return await _context.LoginAttempts
                                 .Where(a => a.IPAddress == ipAddress && a.Timestamp >= since)
                                 .OrderByDescending(a => a.Timestamp)
                                 .ToListAsync();
        }
    }
}

