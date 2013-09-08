{-| -}

module FromHTML (plugin) where
import Data.List.Utils (join)
import Network.Gitit.Interface (Plugin(PreCommitTransform), PluginM, askMeta, askText)
import Network.Gitit.Page (parseMetadata)
import Text.Pandoc
import Text.JSON.Generic (decodeJSON)

plugin :: Plugin
plugin = PreCommitTransform fromHTML

findHead :: [String] -> [String] -> (String, String)
-- beginning of metadata: initialize header list
findHead ("---":r) [] = findHead r ["---"]
-- no metadata: just return contents
findHead (l:ls) [] = ("", unlines (l:ls))
-- end of metadata: return result
findHead ("...":r) m = (join "\n" $ m ++ ["...\n"], unlines r)
-- in metadata: add current line to metadata list, recurse.
findHead (s:r) m = findHead r (m ++ [s])
{-
findHead (s:r) m | s == "..." = (join "\n" $ m ++ [s], unlines r)
                 | otherwise = findHead r (m ++ [s])
-}

splitPage :: String -> (String, String) 
splitPage raw = findHead (lines raw) []

fromHTML :: String -> PluginM  String
fromHTML raw = do
  let (meta, content) = splitPage $ filter (/='\r') raw
--  let text = writeMarkdown defaultWriterOptions $ readHtml defaultParserState content
  let text = writeMarkdown def $ readHtml def content
  return $  meta ++ text

