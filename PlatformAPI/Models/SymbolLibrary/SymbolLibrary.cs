public class SymbolLibrary
{
    // int
    public int Id { get; set; }

    // nvarchar(50)
    public string Name { get; set; } = string.Empty;

    // nvarchar(10) — nullable
    public string? UnicodeValue { get; set; }

    // nvarchar(10) — nullable
    public string? LatexValue { get; set; }

    // int
    public int CategoryId { get; set; }

    // nvarchar(25)
    public string Description { get; set; } = string.Empty;

    // nvarchar(50) — nullable
    public string? AssetPath { get; set; }

    // int
    public int SortOrder { get; set; }

    // bit
    public bool IsActive { get; set; }
}