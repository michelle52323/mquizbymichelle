namespace PlatformAPI.Models.Themes
{
    public class Theme
    {
        public int Id {  get; set; }

        public string Description { get; set; }

        public int? SortOrder { get; set; }

        public bool IsActive { get; set; }

    }
}
