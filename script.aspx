<%@ Page Language="C#" Debug="true" %>
<%@ Import Namespace="Newtonsoft" %>
<%@ Import Namespace="Newtonsoft.Json" %>
<%@ Import Namespace="System.Collections.Generic" %>
<%@ Import Namespace="System.Data" %>
<%@ Import Namespace="System.Data.OleDb" %>

<script language="C#" runat="server">
class BDict : DictionaryBase
{
	public Dictionary<string, List<object>> d;

	public BDict()
	{
		d = new Dictionary<string, List<object>>();
	}

	public void Add(String key, object value)
	{
		if (!d.ContainsKey(key))
		{
			d[key] = new List<object>();
		}
		d[key].Add(value);
	}

	public Dictionary<string, List<object>> GetDict()
	{
		return d;
	}
}

class Main
{
	public BDict inputs;
	public BDict outputs;
	public string path;
	public string sql;
	public NameValueCollection p;
	public string where;
	public string[] whereFields;

	public Main(string inPath)
	{
		inputs = new BDict();
		inputs.Add("housing","A");

		outputs = new BDict();

		path = inPath;
		p = new NameValueCollection();
	}

	public string buildWhere(string[] fields, OleDbCommand com)
	{
		string s1 = " WHERE ";
		List<string> s2 = new List<string>();
		Regex rgx = new Regex("[^a-zA-Z0-9 -]");
		//List<string> str = new List<string>();
		foreach (string field in fields)
		{
			s2.Add(field+" = ?");
			OleDbParameter parameter = com.Parameters.Add("@InputParm", OleDbType.VarChar, 12);
			string val = rgx.Replace(field, String.Empty).ToLower();
			if (p.Get(val) != null)
			{
				parameter.Value = p.Get(field);
			}
			else
			{
				parameter.Value = "X";
			}
			//str.Add(p.Get(val));
		}
		//where = String.Join(", ", str.ToArray());
		if (s2.Count > 0) return s1+String.Join(" AND ", s2.ToArray());
		else return "";
	}


	public void post(NameValueCollection arr)
	{
		foreach (string index in arr)
		{
			inputs.Add(index, arr[index]);
		}
	}


}
public string buildInsert(string table, NameValueCollection src, string[] fields)
{
	var keys = from index in fields select index;
	var values = from index in fields select "'" + src.Get(index).ToString().Replace("'", "''") + "'";
	return "INSERT INTO "+table+" ("+String.Join(", ", keys.ToArray())+") VALUES("+String.Join(", ", values.ToArray())+")";
}

public void Page_Load()
{

	DB db = new DB(ConfigurationManager.ConnectionStrings["gp2040"].ConnectionString);

	if (!String.IsNullOrEmpty(Request.QueryString["submit"]))
	{
		NameValueCollection p = new NameValueCollection();
		foreach (string index in Request.Form)
		{
			p.Add(index, Request.Form[index]);
		}
		string ip = Request.ServerVariables["HTTP_X_FORWARDED_FOR"];
		if (String.IsNullOrEmpty(ip) || ip.Trim().Length == 0)
			ip = Request.ServerVariables["REMOTE_ADDR"];
		p.Add("ip_address",ip);
		string s = buildInsert("responses2_1", p, new string[] {"ip_address","housing","dev","taxes","taxamount","taxtypeother","mroad","mtransit","enhance","mbikeped","mfreq","transitfirst","newdev","Acres","VMT","BikePed","Transit","RoadCon","TransitCon","Costs","Congestion","GHG","Safety","max","spending","remaining","age","zipcode","comments"});
		OleDbParameter param = new OleDbParameter("id",OleDbType.Numeric);
		param.Direction = ParameterDirection.Output;
		string id = db.executeNonQuery(s+" returning id into :id", new OleDbParameter[] {param});

		if (!String.IsNullOrEmpty(Request.Form["taxtype[]"]))
		{
			string[] taxtype = Request.Form["taxtype[]"].Split(',');
			for (int i = 0; i < taxtype.Length; i++)
			{
				db.executeNonQuery("insert into responses2_1_taxtype (response_id, taxtype) values("+id+", '"+taxtype[i]+"')");
			}
		}
		if (!String.IsNullOrEmpty(Request.Form["newtransit[]"]))
		{
			string[] newtransit = Request.Form["newtransit[]"].Split(',');
			for (int i =0; i < newtransit.Length; i++)
			{
				db.executeNonQuery("insert into responses2_1_newtransit (response_id, newtransit) values("+id+", '"+newtransit[i]+"')");
			}
		}
		if (db.Error != null) Response.Write(JsonConvert.SerializeObject(new {success=false, error=db.Error.Message, sql=s}));
		else Response.Write(JsonConvert.SerializeObject(new {success=true}));
	}
	else if (!String.IsNullOrEmpty(Request.QueryString["avg"]))
	{
		DataTable table = db.getTable("select avg(Acres) \"Acres\", avg(VMT) \"VMT\", avg(BikePed) \"BikePed\", avg(Transit) \"Transit\", avg(RoadCon) \"RoadCon\", avg(TransitCon) \"TransitCon\", avg(GHG) \"GHG\", avg(Congestion) \"Congestion\", avg(Safety) \"Safety\", avg(Costs) \"Costs\" from RESPONSES2_1 where housing != '2010' ");
		var output = table.Rows[0].Table.Columns.Cast<DataColumn>().ToDictionary(c => c.ColumnName, c => table.Rows[0][c]);
		Dictionary<string, object[]> o = new Dictionary<string, object[]>();
		o.Add("rows", new object[] {output});
		Response.Write(JsonConvert.SerializeObject(o));
	}
	else
	{
		string[] whereFields = new string[] {"SCENARIO","DENSITY"};
		Regex rgx = new Regex("[^a-zA-Z0-9 -]");
		var f = from w in whereFields select Request.QueryString[rgx.Replace(w, String.Empty).ToLower()];
		DataTable table = db.getTable("select * from LOOKUP2_1 where conc LIKE '"+String.Join("",f.ToArray())+"%'");
		var output = table.Rows[0].Table.Columns.Cast<DataColumn>().ToDictionary(c => c.ColumnName.ToLower(), c => table.Rows[0][c]);
		Dictionary<string, object[]> o = new Dictionary<string, object[]>();
		o.Add("rows", new object[] {output});
		Response.Write(JsonConvert.SerializeObject(o));

	}

	db.close();
	/////////////////////////////////////////
}

/**
 * Helper class for DB interaction, contains Statement subclass for building queries.
 *
 */
public class DB
{
	private string _connectionString;
	public string connectionString
	{
		get { return _connectionString; }
		set { _connectionString = value; }
	}

	private OleDbDataReader _Records;
	public OleDbDataReader Records
	{
		get { return _Records; }
		set { _Records = value; }
	}

	private OleDbConnection _connection;
	public OleDbConnection connection
	{
		get { return _connection; }
		set { _connection = value; }
	}

	private Exception _Error;
	public Exception Error
	{
		get { return _Error; }
		set { _Error = value; }
	}

	public DB(string connstr)
	{
		connectionString = connstr;
		OleDbConnection conn = new OleDbConnection();
		conn.ConnectionString = connectionString;
		conn.Open();
		connection = conn;
	}

	public OleDbDataReader executeReader(string s)
	{
		try
		{
			OleDbCommand com = new OleDbCommand(s, connection);
			OleDbDataReader dr = com.ExecuteReader();
			com.Dispose();
			Records = dr;
			return Records;
		}
		catch (Exception e)
		{
			Error = e;
			return null;
		}
	}

	public DataTable getTable(string s)
	{
		OleDbDataAdapter a = new OleDbDataAdapter(s, connection);
		DataSet set = new DataSet();
		a.Fill(set);
		return set.Tables[0];
	}

	public string executeNonQuery(string s)
	{
		return executeNonQuery(s, null);
	}

	public string executeNonQuery(string s, OleDbParameter[] param)
	{
		try
		{
			OleDbCommand com = new OleDbCommand(s, connection);
			OleDbParameter output = null;
			if (param != null) for (int i=0; i < param.Length; i++)
			{
				com.Parameters.Add(param[i]);
				if (param[i].Direction == ParameterDirection.Output) output = param[i];
			}
			int rows = com.ExecuteNonQuery();
			//com.Dispose();
			if (output != null) return com.Parameters[output.ParameterName].Value.ToString();//output
			return rows.ToString();
		}
		catch (Exception e)
		{
			Error = e;
			return null;
		}
	}

	public void close()
	{
		if (Records != null) Records.Close();
		if (connection != null) connection.Close();
		Records = null;
		connection = null;
	}

	/**
	 * Compiles SQL statements as a string using chained commands
	 */
	public class Statement
	{
		private string _statementString;
		public string statementString
		{
			get { return _statementString; }
			set { _statementString = value; }
		}
		private List<string> _wheres = new List<string>();
		private string _order = "";

		public Statement()
		{

		}

		public Statement(string s)
		{
			statementString = s;
		}

		public override string ToString()
		{
			if (_wheres.Count > 0) statementString += " WHERE ("+String.Join(") AND (",_wheres.ToArray())+")";
			statementString += _order+"";

			string p = @"\s+";
			Regex r = new Regex(p);
			string s = r.Replace(statementString, " ");

			return s;
		}

		public Statement select(string el, string table)
		{
			statementString = "SELECT "+el+" FROM "+table;
			return this;//new Statement(statementString);
		}

		public Statement where(string s)
		{
			_wheres.Add(s);
			return this;//new Statement(statementString);
		}

		public Statement where(string key, string value)
		{
			_wheres.Add(key+" = '"+value+"'");
			return this;//new Statement(statementString);
		}

		public Statement where(string s, string key, string value)
		{
			_wheres.Add(s.Replace("$1",key).Replace("$2",value));
			return this;//new Statement(statementString);
		}

		public Statement insert(string table, Dictionary<string,string> fields)
		{
			string[] keys = new string[fields.Keys.Count];
			fields.Keys.CopyTo(keys, 0);

			string[] values = new string[fields.Count];
			fields.Values.CopyTo(values, 0);

			statementString = "INSERT INTO "+table+" ("+String.Join(",",keys)+") VALUES ('"+String.Join("','",values)+"')";
			return this;//new Statement(statementString);
		}

		public Statement update(string table, Dictionary<string,string> fields)
		{
			List<string> s = new List<string>();
			foreach (KeyValuePair<string, string> el in fields)
			{
				s.Add(el.Key+"='"+el.Value+"'");
			}
			statementString = "UPDATE "+table+" SET "+String.Join(", ",s.ToArray());
			return this;//new Statement(statementString);
		}

		public Statement order(string s)
		{
			_order = " ORDER BY "+s+" asc";
			return this;
		}

		public Statement order(string s, bool dir)
		{
			_order = " ORDER BY "+s+" "+(dir?"asc":"desc");
			return this;
		}
	}
}
</script>
