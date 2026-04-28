using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using Microsoft.VisualStudio.TestPlatform.TestHost;


namespace PlatformAPI.Tests
{
    public class BasicTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public BasicTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task RootEndpoint_ReturnsSuccess()
        {
            var response = await _client.GetAsync("/");

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

    }

}
