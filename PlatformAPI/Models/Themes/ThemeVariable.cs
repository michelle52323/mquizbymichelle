namespace PlatformAPI.Models.Themes
{
    public class ThemeVariable
    {

        public int Id { get; set; }

        public string Description { get; set; }

        public int? GroupId { get; set; }

        public int SortOrder { get; set; }
    }
}
