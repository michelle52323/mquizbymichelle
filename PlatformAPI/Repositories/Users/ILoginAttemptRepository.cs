using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PlatformAPI.Models.Users;

namespace PlatformAPI.Repositories.Interfaces
{
    public interface ILoginAttemptRepository
    {
        Task<IEnumerable<LoginAttempt>> GetAttemptsByUsernameAsync(string username, DateTime since);
        Task<IEnumerable<LoginAttempt>> GetAttemptsByIpAsync(string ipAddress, DateTime since);
    }
}

