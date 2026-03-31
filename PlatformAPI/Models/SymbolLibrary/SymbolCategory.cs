namespace PlatformAPI.Models.SymbolLibrary
{
    public class SymbolCategory
    {
        // int
        public int Id { get; set; }

        // nvarchar(50)
        public string Description { get; set; } = string.Empty;

        // int
        public int SortOrder { get; set; }

        // bit
        public bool IsActive { get; set; }
    }
}