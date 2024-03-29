import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class Article {

private static final String URL = "https://jsonmock.hackerrank.com/api/articles";

public static void main(String[] args) throws IOException {				
	int records=2;				
	
	Map<String, Integer> titles = getArticles();		
	Map<String,Integer> sortedMap = 
			titles.entrySet().stream()
		    .sorted(Entry.comparingByValue(Comparator.reverseOrder()))
		    .collect(Collectors.toMap(Entry::getKey, Entry::getValue,
		                              (e1, e2) -> e1, LinkedHashMap::new));		
	List<String> keyList=new LinkedList<>(sortedMap.keySet());
	
	for (int i=0;i<records;i++) {
		System.out.println(sortedMap.get(keyList.get(i))+"-> "+keyList.get(i));
	}
}


private static Map<String, Integer> getArticles() throws IOException {
	Map<String,Integer> titles=new LinkedHashMap<>();				
	int page = 1;
	int totalPage = 1;
	String response;

	while (page <= totalPage) {
		URL obj = new URL(URL + "?page=" + page);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();
		con.setRequestMethod("GET");
		BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));

		while ((response = in.readLine()) != null) {				
			JsonObject jsonResponse = new Gson().fromJson(response, JsonObject.class);
			totalPage = jsonResponse.get("total_pages").getAsInt();
			JsonArray data = jsonResponse.getAsJsonArray("data");

			for (JsonElement e : data) {					
				JsonElement ele=e.getAsJsonObject().get("title")!=null ? e.getAsJsonObject().get("title") : e.getAsJsonObject().get("story_title")!=null ?e.getAsJsonObject().get("story_title") : null;										
				if(!ele.isJsonNull()) {
					String title = ele.getAsString();							
					JsonElement commentEle=e.getAsJsonObject().get("num_comments");																		
					int comments_count=commentEle.isJsonNull() ? 0 : commentEle.getAsInt();						
					titles.put(title,comments_count);
				}
			}
		}
		page++;
	}
	return titles;
}