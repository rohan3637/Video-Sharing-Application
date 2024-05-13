CREATE TABLE if NOT EXISTS youtube.videoData(
  id int auto_increment not null primary key,
  title varchar(255) not null,
  description varchar(255),
  author varchar(50) not null,
  url varchar(255) not null,
  transcoded_url varchar(255),
  updatedAt timestamp not null default current_timestamp on update current_timestamp,
  createdAt timestamp not null default current_timestamp
);


