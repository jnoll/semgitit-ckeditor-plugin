{-| -}

module FromJSON (plugin) where
import Data.List.Utils (join)
import Network.Gitit.Interface (Plugin(PreCommitTransform), PluginM, askMeta, askText)
import Network.Gitit.Page (parseMetadata)
import Text.Pandoc -- (writeMarkdown, defaultWriterState)
import Text.JSON.Generic (decodeJSON)

plugin :: Plugin
plugin = PreCommitTransform fromJSON

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

fromJSON :: String -> PluginM  String
fromJSON raw = do
  let (meta, json) = splitPage $ filter (/='\r') raw
  let text = writeMarkdown defaultWriterOptions $ decodeJSON json
  return $  meta ++ text

