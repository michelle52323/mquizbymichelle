using System.ComponentModel.DataAnnotations.Schema;

namespace PlatformAPI.Models.Themes
{
    public class ThemeVariableColor
    {

        public int ThemeId { get; set; }

        public int ThemeVariableId { get; set; }

        public string Color { get; set; }

        public ThemeVariable ThemeVariable { get; set; }
    }
}
